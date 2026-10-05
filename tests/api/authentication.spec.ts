import { test, expect } from '../../src/fixtures';
import { config } from '../../src/config';
import { parseWithSchema } from '../../src/schemas/parse';
import { TokenSchema, UserSchema } from '../../src/schemas/user.schema';

test('login with valid credentials returns a token that matches the contract', async ({ api }) => {
  const response = await api.login(config.customer.email, config.customer.password);
  expect(response.status()).toBe(200);
  parseWithSchema(TokenSchema, await response.json());
});

test('login with an unknown email returns 401 Unauthorized', async ({ api }) => {
  const response = await api.login('unknown@example.com', 'wrong-password');
  expect(response.status()).toBe(401);
  expect(await response.json()).toEqual({ error: 'Unauthorized' });
});

test('GET /users/me with a token returns the current user without the password', async ({ api, customerToken }) => {
  const response = await api.getMe(customerToken);
  expect(response.status()).toBe(200);

  const body = await response.json();
  const profile = parseWithSchema(UserSchema, body);
  expect(profile.email).toBe(config.customer.email);
  expect(body).not.toHaveProperty('password');
});

test('GET /users/me without a token returns 401', async ({ api }) => {
  const response = await api.getMe();
  expect(response.status()).toBe(401);
});