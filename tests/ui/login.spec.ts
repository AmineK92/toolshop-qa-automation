import { test, expect } from '../../src/fixtures';
import { config } from '../../src/config';
import { Header } from '../../src/components/header';
import { AccountPage } from '../../src/pages/account-page';
import { LoginPage } from '../../src/pages/login-page';

test('customer signs in with the form and lands on the account page', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(config.customer.email, config.customer.password);

  await expect(page).toHaveURL(/\/account$/);
  await expect(new AccountPage(page).title).toHaveText('My account');
  await expect(new Header(page).userMenu).toContainText('Jane Doe');
});

test('an unknown email shows an error message', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('unknown@example.com', 'wrong-password');

  await expect(loginPage.errorMessage).toContainText('Invalid email or password');
});