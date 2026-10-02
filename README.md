# Toolshop QA Automation

[![Tests](https://github.com/AmineK92/toolshop-qa-automation/actions/workflows/tests.yml/badge.svg)](https://github.com/AmineK92/toolshop-qa-automation/actions/workflows/tests.yml)
[![Nightly](https://github.com/AmineK92/toolshop-qa-automation/actions/workflows/nightly.yml/badge.svg)](https://github.com/AmineK92/toolshop-qa-automation/actions/workflows/nightly.yml)

End-to-end test automation project (Playwright + TypeScript) targeting the Toolshop demo e-commerce application.

**Stack:** Playwright, TypeScript, Zod, ESLint, Docker Compose, GitHub Actions

**Latest nightly report (Chromium, Firefox and WebKit):** https://aminek92.github.io/toolshop-qa-automation/

## Run it locally
1. `docker compose up -d`
2. `docker compose exec laravel-api php artisan migrate:fresh --seed`
3. `npm install` then `npx playwright install`
4. Create your `.env` file from the template: `cp .env.example .env` (on Windows: `copy .env.example .env`)
5. `npx playwright test`

## Continuous integration (GitHub Actions)
- **On every push and pull request:** type check, lint, then the full API and UI suite on Chromium, against a Toolshop instance started with Docker Compose
- **Every night:** the same suite on Chromium, Firefox and WebKit, split across 3 parallel machines (sharding); the merged HTML report is published on GitHub Pages
- Credentials are stored as GitHub Actions secrets, never in the repository

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

## Observations (documented with `test.fail`)
- Brands can be created without authentication (`POST /brands`)
- "Payment was successful" is shown before the order exists; a second click places it
- The home page stays in its loading state when the product list request fails
- Accessibility: the show/hide password button has no accessible name (`button-name`)
- Accessibility: the sub-category filters are not a valid list structure (`list`)
