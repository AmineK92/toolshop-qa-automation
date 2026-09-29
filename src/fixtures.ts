import { test as base, expect } from '@playwright/test';
import { ToolshopApi } from './api/toolshop-api';
import { config } from './config';
import { newBrandData, newCustomerData } from './data/factories';
import { BrandSchema, type Brand } from './schemas/brand.schema';
import { parseWithSchema } from './schemas/parse';

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
};

export const test = base.extend<Fixtures>({
  api: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: config.apiUrl,
      extraHTTPHeaders: { Accept: 'application/json' },
    });
    await use(new ToolshopApi(context));
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

    // Après le test, même en cas d'échec : on supprime tout ce qui a été enregistré.
    // Une donnée déjà supprimée par le test renvoie 404, ce qui est sans conséquence.
    for (const id of brandIds) await api.deleteBrand(id, adminToken);
    for (const id of userIds) await api.deleteUser(id, adminToken);
  },

  createTestBrand: async ({ api, cleanup }, use) => {
    await use(async () => {
      const response = await api.createBrand(newBrandData());
      expect(response.status(), 'création de la marque de test').toBe(201);
      const brand = parseWithSchema(BrandSchema, await response.json());
      cleanup.brand(brand.id);
      return brand;
    });
  },

  createTestCustomer: async ({ api, cleanup }, use) => {
    await use(async () => {
      const data = newCustomerData();
      const response = await api.registerUser(data);
      expect(response.status(), 'inscription du client de test').toBe(201);
      const { id } = await response.json();
      cleanup.user(id);
      const token = await api.getToken(data.email, data.password);
      return { id, email: data.email, token };
    });
  },
});

export { expect };