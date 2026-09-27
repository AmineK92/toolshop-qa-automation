# Toolshop QA Automation

End-to-end test automation project (Playwright + TypeScript) targeting the Toolshop demo e-commerce application.

## Run it locally
1. `docker compose up -d`
2. `docker compose exec laravel-api php artisan migrate:fresh --seed`
3. `npm install` then `npx playwright install`
4. `npx playwright test`

## Status
Day 1: environment set up, first API and UI tests.