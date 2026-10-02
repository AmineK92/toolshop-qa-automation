import AxeBuilder from '@axe-core/playwright';
import type { Page, TestInfo } from '@playwright/test';

// WCAG 2.1, levels A and AA: the level usually required for public websites
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

/**
 * Runs an axe accessibility scan on the current page.
 * The full results are attached to the HTML report; the function returns
 * the sorted list of violated rules, so that tests can compare it to a known list.
 */
export async function auditAccessibility(page: Page, testInfo: TestInfo): Promise<string[]> {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

  await testInfo.attach('accessibility-violations', {
    body: JSON.stringify(results.violations, null, 2),
    contentType: 'application/json',
  });

  return results.violations.map((violation) => violation.id).sort();
}