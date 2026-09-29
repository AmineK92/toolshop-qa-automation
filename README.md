# Toolshop QA Automation

End-to-end test automation project (Playwright + TypeScript) targeting the Toolshop demo e-commerce application.

## Run it locally
1. `docker compose up -d`
2. `docker compose exec laravel-api php artisan migrate:fresh --seed`
3. `npm install` then `npx playwright install`
4. `npx playwright test`

## Status
Day 1: environment set up, first API and UI tests.

## What is tested (API)
- Authentication: token contract, invalid credentials, protected endpoints
- Brands: full CRUD lifecycle, validation errors (422 / 409)
- Security (OWASP API Top 10): 401 vs 403, BOLA, admin-only functions, mass assignment
- Known issue documented with `test.fail`: anonymous brand creation
- Test data: unique per test, automatically cleaned up by fixtures