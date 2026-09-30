import { test as base, expect, type Page } from '@playwright/test';
import { ToolshopApi } from './api/toolshop-api';
import { config } from './config';
import { newBrandData, newCustomerData } from './data/factories';
import { BrandSchema, type Brand } from './schemas/brand.schema';
import { parseWithSchema } from './schemas/parse';
import { signInWithToken } from './ui/session';

type Cleanup = {
  brand: (id?: string) => void;
  user: (id?: string) => void;
};

export type TestCustomer = { id: string; email: string; token: string };

type Fixtures = {
  api: ToolshopApi;
  customerToken: string;
  adminToken: string;
  cleanup: Cleanup;
  createTestBrand: () => Promise<Brand>;
  createTestCustomer: () => Promise<TestCustomer>;
  customerPage: Page;
};

export const test = base.extend<Fixtures>({
  api: async ({ playwright }, use) => {
    // Setup: an HTTP client bound to the API, whatever the test project
    const context = await playwright.request.newContext({
      baseURL: config.apiUrl,
      extraHTTPHeaders: { Accept: 'application/json' },
    });
    await use(new ToolshopApi(context));
    // Teardown: runs after the test, even when it fails
    await context.dispose();
  },

  customerToken: async ({ api }, use) => {
    await use(await api.getToken(config.customer.email, config.customer.password));
  },

  adminToken: async ({ api }, use) => {
    await use(await api.getToken(config.admin.email, config.admin.password));
  },

  cleanup: async ({ api, adminToken }, use) => {
    const brandIds: string[] = [];
    const userIds: string[] = [];

    await use({
      brand: (id) => { if (id) brandIds.push(id); },
      user: (id) => { if (id) userIds.push(id); },
    });

    // After the test, even when it fails: delete everything that was registered.
    // Data already deleted by the test returns 404, which is harmless.
    for (const id of brandIds) await api.deleteBrand(id, adminToken);
    for (const id of userIds) await api.deleteUser(id, adminToken);
  },

  createTestBrand: async ({ api, cleanup }, use) => {
    await use(async () => {
      const response = await api.createBrand(newBrandData());
      expect(response.status(), 'create the test brand').toBe(201);
      const brand = parseWithSchema(BrandSchema, await response.json());
      cleanup.brand(brand.id);
      return brand;
    });
  },

  createTestCustomer: async ({ api, cleanup }, use) => {
    await use(async () => {
      const data = newCustomerData();
      const response = await api.registerUser(data);
      expect(response.status(), 'register the test customer').toBe(201);
      const { id } = await response.json();
      cleanup.user(id);
      const token = await api.getToken(data.email, data.password);
      return { id, email: data.email, token };
    });
  },

  customerPage: async ({ page, customerToken }, use) => {
    // A browser page already signed in as the demo customer, without the login form
    await signInWithToken(page, customerToken);
    await use(page);
  },
});

export { expect };