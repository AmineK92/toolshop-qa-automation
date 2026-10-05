import { test, expect } from '../../src/fixtures';
import { newBrandData } from '../../src/data/factories';

test('deleting a brand without a token returns 401', async ({ api, createTestBrand }) => {
  const brand = await createTestBrand();
  const response = await api.deleteBrand(brand.id);
  expect(response.status()).toBe(401);
});

test('a customer cannot delete a brand (403)', async ({ api, createTestBrand, customerToken }) => {
  const brand = await createTestBrand();
  const response = await api.deleteBrand(brand.id, customerToken);
  expect(response.status()).toBe(403);
});

test('BOLA: a customer cannot read another customer\'s profile', async ({ api, createTestCustomer }) => {
  const alice = await createTestCustomer();
  const bob = await createTestCustomer();

  await test.step('control: Alice reads her own profile', async () => {
    const response = await api.getUser(alice.id, alice.token);
    expect(response.status()).toBe(200);
  });

  await test.step('Alice tries to read Bob\'s profile', async () => {
    const response = await api.getUser(bob.id, alice.token);
    expect(response.status()).toBe(404);
    expect(await response.text()).not.toContain(bob.email);
  });
});

test('only an admin can list users', async ({ api, adminToken, customerToken }) => {
  await test.step('control: the admin gets the list', async () => {
    const response = await api.listUsers(adminToken);
    expect(response.status()).toBe(200);
  });

  await test.step('the customer is refused (403)', async () => {
    const response = await api.listUsers(customerToken);
    expect(response.status()).toBe(403);
  });
});

test('a customer cannot make themselves admin (mass assignment)', async ({ api, createTestCustomer }) => {
  const customer = await createTestCustomer();

  const response = await api.patchUser(customer.id, { role: 'admin' }, customer.token);
  expect(response.status(), 'the API must not crash').toBeLessThan(500);

  const adminOnly = await api.listUsers(customer.token);
  expect(adminOnly.status()).toBe(403);
});

test('observation: creating a brand should require authentication', async ({ api, cleanup }) => {
  // Precondition: the API answers normally, so a failure below can only come from the observation
  expect((await api.getProducts()).status()).toBe(200);

  // Only the assertion below is expected to fail: it documents the observation
  test.fail();
  test.info().annotations.push({
    type: 'observation',
    description: 'POST /brands accepts anonymous requests and creates the brand (201 instead of 401).',
  });
  const response = await api.createBrand(newBrandData());
  const body = await response.json();
  cleanup.brand(body.id); // today the brand is created: make sure it is deleted after the test
  expect(response.status()).toBe(401);
});