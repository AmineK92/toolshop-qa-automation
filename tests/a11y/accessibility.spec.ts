import { test, expect } from '../../src/fixtures';
import { findBuyableProduct } from '../../src/data/catalog';
import { HomePage } from '../../src/pages/home-page';
import { LoginPage } from '../../src/pages/login-page';
import { ProductPage } from '../../src/pages/product-page';
import { auditAccessibility } from '../../src/ui/accessibility';

// Known accessibility defects, page by page: the rules each page violates today.
// The tests fail when a new violation appears, and also when a known one is fixed:
// the list must then be updated, so it always reflects the real state of the site.
const KNOWN_VIOLATIONS: Record<string, string[]> = {
  home: [
    'list', // the sub-category filters use a <ul> without <li> items
  ],
  login: [
    'button-name', // the show/hide password button only contains an icon, with no accessible name
  ],
  product: [],
};

test('home page has no new accessibility violations', async ({ page }, testInfo) => {
  const home = new HomePage(page);
  await home.goto();
  await expect(home.productNames.first()).toBeVisible();

  expect(await auditAccessibility(page, testInfo)).toEqual(KNOWN_VIOLATIONS.home);
});

test('login page has no new accessibility violations', async ({ page }, testInfo) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await expect(loginPage.submitButton).toBeVisible();

  expect(await auditAccessibility(page, testInfo)).toEqual(KNOWN_VIOLATIONS.login);
});

test('product page has no new accessibility violations', async ({ page, api }, testInfo) => {
  const product = await findBuyableProduct(api);
  const productPage = new ProductPage(page);
  await productPage.goto(product.id);
  await expect(productPage.name).toBeVisible();

  expect(await auditAccessibility(page, testInfo)).toEqual(KNOWN_VIOLATIONS.product);
});