import { test, expect } from '@playwright/test';

test('un client se connecte et arrive sur son compte', async ({ page }) => {
  await page.goto('/auth/login');

  await page.getByTestId('email').fill('customer@practicesoftwaretesting.com');
  await page.getByTestId('password').fill('welcome01');
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