import * as z from 'zod';

export const InvoiceSummarySchema = z.object({
  id: z.string(),
  invoice_number: z.string(),
});

export const InvoicePageSchema = z.object({
  total: z.number().int(),
  data: z.array(InvoiceSummarySchema),
});