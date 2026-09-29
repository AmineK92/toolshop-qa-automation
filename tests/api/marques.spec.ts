import { test, expect } from '../../src/fixtures';
import { newBrandData } from '../../src/data/factories';
import { BrandSchema } from '../../src/schemas/brand.schema';
import { parseWithSchema } from '../../src/schemas/parse';

test('cycle de vie d’une marque : création, lecture, modification, suppression', async ({ api, adminToken, cleanup }) => {
  const brand = await test.step('créer la marque', async () => {
    const data = newBrandData();
    const response = await api.createBrand(data);
    expect(response.status()).toBe(201);

    const created = parseWithSchema(BrandSchema, await response.json());
    cleanup.brand(created.id);
    expect(created.name).toBe(data.name);
    return created;
  });

  await test.step('la relire', async () => {
    const response = await api.getBrand(brand.id);
    expect(response.status()).toBe(200);
    expect(parseWithSchema(BrandSchema, await response.json())).toEqual(brand);
  });

  await test.step('la modifier', async () => {
    const newData = newBrandData();
    const response = await api.updateBrand(brand.id, newData);
    expect(response.status()).toBe(200);

    const rereadResponse = await api.getBrand(brand.id);
    const reread = parseWithSchema(BrandSchema, await rereadResponse.json());
    expect(reread.name).toBe(newData.name);
  });

  await test.step('la supprimer en tant qu’administrateur', async () => {
    const response = await api.deleteBrand(brand.id, adminToken);
    expect(response.status()).toBe(204);

    const afterDelete = await api.getBrand(brand.id);
    expect(afterDelete.status()).toBe(404);
  });
});

test('création refusée si le nom et le slug manquent (422)', async ({ api }) => {
  const response = await api.createBrand({});
  expect(response.status()).toBe(422);

  const errors = await response.json();
  expect(errors).toHaveProperty('name');
  expect(errors).toHaveProperty('slug');
});

test('création refusée pour un slug contenant des espaces (422)', async ({ api }) => {
  const response = await api.createBrand({ name: 'Marque QA', slug: 'slug avec espaces' });
  expect(response.status()).toBe(422);
  expect(await response.json()).toHaveProperty('slug');
});

test('création refusée pour un slug déjà utilisé (409)', async ({ api, createTestBrand }) => {
  const existing = await createTestBrand();

  const duplicate = await api.createBrand({ name: 'Autre nom', slug: existing.slug });
  expect(duplicate.status()).toBe(409);
  expect(await duplicate.json()).toEqual({ slug: ['A brand already exists with this slug.'] });
});