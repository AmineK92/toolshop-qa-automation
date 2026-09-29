import * as z from 'zod';

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number().positive(),
  is_rental: z.boolean(),
  in_stock: z.boolean(),
  category: z.object({ id: z.string(), name: z.string() }),
  brand: z.object({ id: z.string(), name: z.string() }),
});

export const ProductPageSchema = z.object({
  current_page: z.number().int(),
  per_page: z.number().int(),
  total: z.number().int(),
  data: z.array(ProductSchema),
});