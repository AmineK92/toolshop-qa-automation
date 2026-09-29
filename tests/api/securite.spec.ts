import { test, expect } from '../../src/fixtures';
import { newBrandData } from '../../src/data/factories';

test('supprimer une marque sans être connecté est refusé (401)', async ({ api, createTestBrand }) => {
  const brand = await createTestBrand();
  const response = await api.deleteBrand(brand.id);
  expect(response.status()).toBe(401);
});

test('un client ne peut pas supprimer une marque (403)', async ({ api, createTestBrand, customerToken }) => {
  const brand = await createTestBrand();
  const response = await api.deleteBrand(brand.id, customerToken);
  expect(response.status()).toBe(403);
});

test('un client ne peut pas lire le profil d’un autre client (BOLA)', async ({ api, createTestCustomer }) => {
  const alice = await createTestCustomer();
  const bob = await createTestCustomer();

  await test.step('contrôle : Alice lit son propre profil', async () => {
    const response = await api.getUser(alice.id, alice.token);
    expect(response.status()).toBe(200);
  });

  await test.step('Alice tente de lire le profil de Bob', async () => {
    const response = await api.getUser(bob.id, alice.token);
    expect(response.status()).toBe(404);
    expect(await response.text()).not.toContain(bob.email);
  });
});

test('seul un administrateur peut lister les utilisateurs', async ({ api, adminToken, customerToken }) => {
  await test.step('contrôle : l’administrateur obtient la liste', async () => {
    const response = await api.listUsers(adminToken);
    expect(response.status()).toBe(200);
  });

  await test.step('le client est refusé (403)', async () => {
    const response = await api.listUsers(customerToken);
    expect(response.status()).toBe(403);
  });
});

test('un client ne peut pas s’attribuer le rôle administrateur (mass assignment)', async ({ api, createTestCustomer }) => {
  const client = await createTestCustomer();

  const response = await api.patchUser(client.id, { role: 'admin' }, client.token);
  expect(response.status(), 'l’API ne doit pas planter').toBeLessThan(500);

  const adminOnly = await api.listUsers(client.token);
  expect(adminOnly.status()).toBe(403);
});

test.fail('observation : créer une marque devrait exiger d’être connecté', {
  annotation: {
    type: 'observation',
    description: 'POST /brands accepte une requête anonyme (201). À confirmer avec l’équipe produit.',
  },
}, async ({ api, cleanup }) => {
  const response = await api.createBrand(newBrandData());
  cleanup.brand((await response.json()).id);
  expect(response.status()).toBe(401);
});