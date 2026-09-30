import { expect, type Locator, type Page } from '@playwright/test';

export class CheckoutPage {
  // Step 1: cart
  readonly cartProductTitles: Locator;
  readonly proceedFromCartButton: Locator;
  // Step 2: sign-in
  readonly proceedAsSignedInButton: Locator;
  // Step 3: billing address
  readonly cityInput: Locator;
  readonly postcodeLookupLoading: Locator;
  readonly proceedFromAddressButton: Locator;
  // Step 4: payment
  readonly paymentMethodSelect: Locator;
  readonly confirmButton: Locator;
  readonly paymentSuccessMessage: Locator;
  // The confirmation has no data-test attribute, so its id is used instead
  readonly orderConfirmation: Locator;
  readonly invoiceNumber: Locator;

  constructor(page: Page) {
    this.cartProductTitles = page.getByTestId('product-title');
    this.proceedFromCartButton = page.getByTestId('proceed-1');
    this.proceedAsSignedInButton = page.getByTestId('proceed-2');
    this.cityInput = page.getByTestId('city');
    this.postcodeLookupLoading = page.getByTestId('postcode-lookup-loading');
    this.proceedFromAddressButton = page.getByTestId('proceed-3');
    this.paymentMethodSelect = page.getByTestId('payment-method');
    this.confirmButton = page.getByTestId('finish');
    this.paymentSuccessMessage = page.getByTestId('payment-success-message');
    this.orderConfirmation = page.locator('#order-confirmation');
    this.invoiceNumber = this.orderConfirmation.locator('span');
  }

  async proceedFromCart(): Promise<void> {
    await this.proceedFromCartButton.click();
  }

  async proceedAsSignedInCustomer(): Promise<void> {
    await this.proceedAsSignedInButton.click();
  }

  async confirmSavedAddress(): Promise<void> {
    // The app completes street, city and state from the postal code (postcode lookup).
    // Wait for it: the API rejects an address whose city does not match the postal code.
    await expect(this.postcodeLookupLoading).toBeHidden();
    await expect(this.cityInput).not.toHaveValue('');
    await this.proceedFromAddressButton.click();
  }

  async selectCashOnDelivery(): Promise<void> {
    await this.paymentMethodSelect.selectOption('cash-on-delivery');
  }

  async placeOrder(): Promise<void> {
    // The first click only validates the payment method;
    // the order itself is created by the second click.
    await this.confirmButton.click();
    await expect(this.paymentSuccessMessage).toBeVisible();
    await this.confirmButton.click();
  }
}