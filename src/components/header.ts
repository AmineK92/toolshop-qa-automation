import type { Locator, Page } from '@playwright/test';

// The navigation bar is shared by every page, so it is modelled once as a component
export class Header {
  readonly signInLink: Locator;
  readonly userMenu: Locator;
  readonly signOutLink: Locator;
  readonly cartLink: Locator;
  readonly cartQuantity: Locator;

  constructor(page: Page) {
    this.signInLink = page.getByTestId('nav-sign-in');
    this.userMenu = page.getByTestId('nav-menu');
    this.signOutLink = page.getByTestId('nav-sign-out');
    this.cartLink = page.getByTestId('nav-cart');
    this.cartQuantity = page.getByTestId('cart-quantity');
  }

  async signOut(): Promise<void> {
    await this.userMenu.click();
    await this.signOutLink.click();
  }
}