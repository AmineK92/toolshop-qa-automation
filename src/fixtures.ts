import { test as base, expect } from '@playwright/test';
import { ToolshopApi } from './api/toolshop-api';
import { config } from './config';

type Fixtures = {
  api: ToolshopApi;
  customerToken: string;
};

export const test = base.extend<Fixtures>({
  api: async ({ playwright }, use) => {
    // Préparation : un client HTTP réglé sur l'API, quel que soit le projet de tests
    const context = await playwright.request.newContext({
      baseURL: config.apiUrl,
      extraHTTPHeaders: { Accept: 'application/json' },
    });
    await use(new ToolshopApi(context));
    // Nettoyage : exécuté après le test, même s'il a échoué
    await context.dispose();
  },

  customerToken: async ({ api }, use) => {
    await use(await api.getToken(config.customer.email, config.customer.password));
  },
});

export { expect };