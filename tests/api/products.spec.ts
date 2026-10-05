import { test, expect } from '../../src/fixtures';
import { parseWithSchema } from '../../src/schemas/parse';
import { ProductPageSchema } from '../../src/schemas/product.schema';

test('GET /products returns a page that matches the contract', async ({ api }) => {
  const response = await api.getProducts();
  expect(response.status()).toBe(200);

  const productPage = parseWithSchema(ProductPageSchema, await response.json());
  expect(productPage.data.length).toBeGreaterThan(0);
});