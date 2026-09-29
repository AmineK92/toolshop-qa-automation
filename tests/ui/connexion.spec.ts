import { test, expect } from '../../src/fixtures';
import { config } from '../../src/config';

test('un client se connecte et arrive sur son compte', async ({ page }) => {
  await page.goto('/auth/login');

  await page.getByTestId('email').fill(config.customer.email);
  await page.getByTestId('password').fill(config.customer.password);
  await page.getByTestId('login-submit').click();

  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByTestId('page-title')).toHaveText('My account');
  await expect(page.getByTestId('nav-menu')).toContainText('Jane Doe');
});

test('un e-mail inconnu affiche un message d’erreur', async ({ page }) => {
  await page.goto('/auth/login');

  await page.getByTestId('email').fill('inconnu@example.com');
  await page.getByTestId('password').fill('mauvais-mot-de-passe');
  await page.getByTestId('login-submit').click();

  await expect(page.getByTestId('login-error')).toContainText('Invalid email or password');
});