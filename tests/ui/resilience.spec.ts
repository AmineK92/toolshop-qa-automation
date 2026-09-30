import { test, expect } from '../../src/fixtures';
import { HomePage } from '../../src/pages/home-page';
import { apiPath, serverError } from '../../src/ui/network';

test('a failed search does not leave stale results on screen', async ({ page }) => {
  const home = new HomePage(page);
  await home.goto();
  await expect(home.productNames.first()).toBeVisible();

  await page.route(apiPath('/products/search'), serverError);
  await home.search('pliers');

  await expect(home.searchTerm).toHaveText('pliers');
  await expect(home.noResultsMessage).toBeVisible();
  await expect(home.productNames).toHaveCount(0);
});

test('observation: the home page should leave its loading state when the product list fails', async ({ page }) => {
  await page.route(apiPath('/products'), serverError);
  const home = new HomePage(page);
  await home.goto();

  // Precondition: the placeholders must be displayed before checking that they go away,
  // because a "hidden" check passes immediately on an element that is not rendered yet
  await expect(home.loadingPlaceholders.first()).toBeVisible();

  // Only the assertion below is expected to fail: it documents the observation.
  // A failure before this line is reported as a real failure.
  test.fail();
  test.info().annotations.push({
    type: 'observation',
    description: 'When the product list request fails, loading placeholders stay on screen and no error message is shown.',
  });
  await expect(home.loadingPlaceholders.first()).toBeHidden({ timeout: 5_000 });
});