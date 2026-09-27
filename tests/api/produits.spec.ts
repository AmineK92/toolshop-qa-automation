import { test, expect } from '@playwright/test';

test('GET /products renvoie une liste de produits', async ({ request }) => {
  const response = await request.get('/products');
  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body.data.length).toBeGreaterThan(0);

  const premierProduit = body.data[0];
  expect(typeof premierProduit.id).toBe('string');
  expect(typeof premierProduit.name).toBe('string');
  expect(premierProduit.price).toBeGreaterThan(0);
});