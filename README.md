# Toolshop QA Automation

End-to-end test automation project (Playwright + TypeScript) targeting the Toolshop demo e-commerce application.

## Run it locally
1. `docker compose up -d`
2. `docker compose exec laravel-api php artisan migrate:fresh --seed`
3. `npm install` then `npx playwright install`
4. `npx playwright test`

## Status
- environment set up, first API and UI tests.

## What is tested (UI)
- Page Object Model with a reusable header component
- Sign-in through the form, and through the API with a token injected into the browser
- Access control: protected pages redirect anonymous visitors to the login page
- End-to-end checkout for a new customer, confirmed through the API
- Resilience: API failures simulated with network interception

## Observations (documented with `test.fail`)
- Brands can be created without authentication (`POST /brands`)
- "Payment was successful" is shown before the order exists; a second click places it
- The home page stays in its loading state when the product list request fails

## What is tested (API)
- Authentication: token contract, invalid credentials, protected endpoints
- Brands: full CRUD lifecycle, validation errors (422 / 409)
- Security (OWASP API Top 10): 401 vs 403, BOLA, admin-only functions, mass assignment
- Known issue documented with `test.fail`: anonymous brand creation
- Test data: unique per test, automatically cleaned up by fixtures