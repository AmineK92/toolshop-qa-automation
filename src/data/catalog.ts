import type { ToolshopApi } from '../api/toolshop-api';
import { parseWithSchema } from '../schemas/parse';
import { ProductPageSchema, type Product } from '../schemas/product.schema';

// Returns the first product of the catalog that a customer can actually buy
export async function findBuyableProduct(api: ToolshopApi): Promise<Product> {
  const response = await api.getProducts();
  const catalog = parseWithSchema(ProductPageSchema, await response.json());
  const product = catalog.data.find((item) => item.in_stock && !item.is_rental);
  if (!product) {
    throw new Error('No in-stock, non-rental product on the first catalog page');
  }
  return product;
}