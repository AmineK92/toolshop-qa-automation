import type { Page } from '@playwright/test';

// Key under which the Toolshop front end stores the JWT (see its TokenStorageService)
const TOKEN_KEY = 'auth-token';

/**
 * Signs the browser in without using the login form:
 * the token obtained from the API is stored where the app expects it.
 */
export async function signInWithToken(page: Page, token: string): Promise<void> {
  // localStorage belongs to the site's origin, so the app has to be opened first
  await page.goto('/');
  await page.localStorage.setItem(TOKEN_KEY, token);
}