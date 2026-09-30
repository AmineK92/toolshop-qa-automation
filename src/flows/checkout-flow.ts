import type { Page } from '@playwright/test';
import type { ToolshopApi } from '../api/toolshop-api';
import { Header } from '../components/header';
import { findBuyableProduct } from '../data/catalog';
import { test, expect, type TestCustomer } from '../fixtures';
import { CheckoutPage } from '../pages/checkout-page';
import { ProductPage } from '../pages/product-page';
import { signInWithToken } from '../ui/session';

/**
 * Shared purchase journey: signs the customer in, adds one product to the cart
 * and goes through the checkout up to the payment step.
 */
export async function checkoutUntilPayment(page: Page, api: ToolshopApi, customer: TestCustomer): Promise<CheckoutPage> {
  const product = await test.step('pick a buyable product through the API', () => findBuyableProduct(api));

  await test.step('sign in with an API token', () => signInWithToken(page, customer.token));

  await test.step('add the product to the cart', async () => {
    const productPage = new ProductPage(page);
    await productPage.goto(product.id);
    await expect(productPage.name).toContainText(product.name);
    await productPage.addToCart();
    await expect(new Header(page).cartQuantity).toHaveText('1');
  });

  const checkout = new CheckoutPage(page);

  await test.step('go through the cart, sign-in and address steps', async () => {
    await new Header(page).cartLink.click();
    await expect(checkout.cartProductTitles).toHaveCount(1);
    await expect(checkout.cartProductTitles).toContainText(product.name);
    await checkout.proceedFromCart();
    await checkout.proceedAsSignedInCustomer();
    await checkout.confirmSavedAddress();
  });

  return checkout;
}