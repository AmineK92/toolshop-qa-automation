import { test, expect } from '../../src/fixtures';
import { checkoutUntilPayment } from '../../src/flows/checkout-flow';
import { InvoicePageSchema } from '../../src/schemas/invoice.schema';
import { parseWithSchema } from '../../src/schemas/parse';

test('a new customer buys a product and receives an invoice', async ({ page, api, createTestCustomer }) => {
  const customer = await createTestCustomer();
  const checkout = await checkoutUntilPayment(page, api, customer);

  const invoiceNumber = await test.step('pay cash on delivery', async () => {
    await checkout.selectCashOnDelivery();
    await checkout.placeOrder();
    await expect(checkout.orderConfirmation).toContainText('Thanks for your order');
    await expect(checkout.invoiceNumber).toHaveText(/^INV-\d+$/);
    return checkout.invoiceNumber.innerText();
  });

  await test.step('the API lists exactly this invoice for the customer', async () => {
    const response = await api.getInvoices(customer.token);
    expect(response.status()).toBe(200);

    const invoices = parseWithSchema(InvoicePageSchema, await response.json());
    expect(invoices.data.map((invoice) => invoice.invoice_number)).toEqual([invoiceNumber]);
  });
});

test.fail('observation: the first confirmation click should place the order', {
  annotation: {
    type: 'observation',
    description: '"Payment was successful" is displayed after the first click, but the order is only created by a second click.',
  },
}, async ({ page, api, createTestCustomer }) => {
  const customer = await createTestCustomer();
  const checkout = await checkoutUntilPayment(page, api, customer);

  await checkout.selectCashOnDelivery();
  await checkout.confirmButton.click();
  await expect(checkout.paymentSuccessMessage).toBeVisible();
  await expect(checkout.orderConfirmation).toBeVisible({ timeout: 5_000 });
});