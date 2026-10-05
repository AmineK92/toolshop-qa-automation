import * as z from 'zod';

export function parseWithSchema<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Response does not match the contract:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}