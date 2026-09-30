import type { Locator, Page } from '@playwright/test';

export class HomePage {
  readonly productNames: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly searchTerm: Locator;
  readonly noResultsMessage: Locator;
  // The loading placeholders have no data-test attribute, so their CSS classes are used
  readonly loadingPlaceholders: Locator;

  constructor(private readonly page: Page) {
    this.productNames = page.getByTestId('product-name');
    this.searchInput = page.getByTestId('search-query');
    this.searchButton = page.getByTestId('search-submit');
    this.searchTerm = page.getByTestId('search-term');
    this.noResultsMessage = page.getByTestId('no-results');
    this.loadingPlaceholders = page.locator('.card.skeleton');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }
}