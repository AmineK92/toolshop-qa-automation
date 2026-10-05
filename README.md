# Toolshop QA Automation

[![Tests](https://github.com/AmineK92/toolshop-qa-automation/actions/workflows/tests.yml/badge.svg)](https://github.com/AmineK92/toolshop-qa-automation/actions/workflows/tests.yml)
[![Nightly](https://github.com/AmineK92/toolshop-qa-automation/actions/workflows/nightly.yml/badge.svg)](https://github.com/AmineK92/toolshop-qa-automation/actions/workflows/nightly.yml)
<!-- AZURE-BADGE: replace this line with the Markdown copied from Azure DevOps (pipeline > ... > Status badge) -->

End-to-end test automation project (Playwright + TypeScript) targeting the Toolshop demo e-commerce application.

**Stack:** Playwright, TypeScript, Zod, ESLint, axe-core, k6, promptfoo, Gemini API, Docker Compose, GitHub Actions, Azure Pipelines

**Latest nightly report (Chromium, Firefox and WebKit):** https://aminek92.github.io/toolshop-qa-automation/

## Run it locally
1. `docker compose up -d`
2. `docker compose exec laravel-api php artisan migrate:fresh --seed`
3. `npm install` then `npx playwright install`
4. Create your `.env` file from the template: `cp .env.example .env` (on Windows: `copy .env.example .env`)
5. `npx playwright test`
6. Optional: add a Gemini API key to `.env` (`GOOGLE_API_KEY`), then run the AI triage with `node --env-file=.env scripts/triage-failures.mts` and the evaluation with `npx promptfoo@latest eval`

## Continuous integration
- **On every push and pull request (GitHub Actions):** type check, lint, then the full suite on Chromium, against a Toolshop instance started with Docker Compose
- **Every night (GitHub Actions):** the same suite on Chromium, Firefox and WebKit, split across 3 parallel machines (sharding); the merged HTML report is published on GitHub Pages
- **Every night (Azure Pipelines):** the same suite on Microsoft-hosted agents, with JUnit results published in the Tests tab
- Credentials are stored as CI secrets (GitHub Actions secrets, Azure DevOps secure files), never in the repository

## What is tested (API)
- Authentication: token contract, invalid credentials, protected endpoints
- Brands: full CRUD lifecycle, validation errors (422 / 409)
- Security (OWASP API Top 10): 401 vs 403, BOLA, admin-only functions, mass assignment
- Test data: unique per test, automatically cleaned up by fixtures

## What is tested (UI)
- Page Object Model with a reusable header component
- Sign-in through the form, and through the API with a token injected into the browser
- Access control: protected pages redirect anonymous visitors to the login page
- End-to-end checkout for a new customer, confirmed through the API
- Resilience: API failures simulated with network interception

## What is tested (accessibility)
- Automated WCAG 2.1 AA scans with axe-core on the home, login and product pages
- Known violations are listed in the tests: a new violation, or a fixed one, makes the suite fail

## What is tested (visual)
- Screenshot comparisons of the login and product pages, with dynamic areas masked
- One set of reference screenshots per operating system; the Linux ones are generated in CI by a dedicated workflow

## Performance (k6)
- Load test of the catalog API: up to 10 virtual users browsing the product list, product pages and search
- Thresholds on error rate and 95th percentile response time, calibrated from a measured baseline; the run fails if they are not met
- Runs nightly in GitHub Actions against the Toolshop API started in the pipeline, with an HTML report as artifact

## AI-assisted triage
- When tests fail in CI, a script sends each failure to a language model (Gemini) and adds a suggested category (product bug, test bug, environment, flaky) and a next step to the job summary
- The prompt lives in `prompts/triage.txt`; the suggestions are a starting point, never a verdict

## AI evaluation (promptfoo)
- The triage prompt is tested against a set of known failures: valid JSON, expected category, model-graded explanation and latency
- A naive prompt (`prompts/triage-naive.txt`) is kept as a baseline to measure the benefit of the detailed prompt
- The evaluation runs in CI whenever the prompt changes, so a prompt regression is caught early

## Observations (found and documented by the tests)
- Brands can be created without authentication (`POST /brands`)
- "Payment was successful" is shown before the order exists; a second click places it
- The home page stays in its loading state when the product list request fails
- Accessibility: the show/hide password button has no accessible name (`button-name`)
- Accessibility: the sub-category filters are not a valid list structure (`list`)
