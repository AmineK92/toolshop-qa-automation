import { test, expect } from '../../src/fixtures';
import { Header } from '../../src/components/header';
import { AccountPage } from '../../src/pages/account-page';

test('a signed-in customer opens the account page directly', async ({ customerPage }) => {
  const accountPage = new AccountPage(customerPage);
  await accountPage.goto();

  await expect(accountPage.title).toHaveText('My account');
  await expect(new Header(customerPage).userMenu).toContainText('Jane Doe');
});

test('an anonymous visitor is redirected to the login page', async ({ page }) => {
  await new AccountPage(page).goto();

  await expect(page).toHaveURL(/\/auth\/login$/);
});

test('a signed-in customer can sign out', async ({ customerPage }) => {
  const accountPage = new AccountPage(customerPage);
  const header = new Header(customerPage);
  await accountPage.goto();
  await expect(accountPage.title).toHaveText('My account');

  await header.signOut();

  await expect(header.signInLink).toBeVisible();
  await expect(customerPage).toHaveURL(/\/auth\/login$/);
});