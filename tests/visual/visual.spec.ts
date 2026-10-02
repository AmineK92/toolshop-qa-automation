import { test, expect } from '../../src/fixtures';
import { findBuyableProduct } from '../../src/data/catalog';
import { LoginPage } from '../../src/pages/login-page';
import { ProductPage } from '../../src/pages/product-page';

test('login page looks as expected', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await expect(loginPage.submitButton).toBeVisible();

  await expect(page).toHaveScreenshot('login-page.png');
});

test('product page looks as expected', async ({ page, api }) => {
  const product = await findBuyableProduct(api);
  const productPage = new ProductPage(page);
  await productPage.goto(product.id);
  await expect(productPage.name).toBeVisible();

  // Wait until the product image has really finished loading
  const productImage = page.getByRole('img', { name: product.name }).first();
  await expect(productImage).toHaveJSProperty('complete', true);

  // Related products may change from one run to the next: they are hidden from the comparison
  const relatedProducts = page.getByRole('heading', { name: 'Related products' }).locator('..');
  await expect(page).toHaveScreenshot('product-page.png', { mask: [relatedProducts] });
});