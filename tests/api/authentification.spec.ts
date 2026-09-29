import { test, expect } from '../../src/fixtures';
import { config } from '../../src/config';
import { parseWithSchema } from '../../src/schemas/parse';
import { TokenSchema, UserSchema } from '../../src/schemas/user.schema';

test('connexion réussie : l’API renvoie un jeton conforme', async ({ api }) => {
  const response = await api.login(config.customer.email, config.customer.password);
  expect(response.status()).toBe(200);
  parseWithSchema(TokenSchema, await response.json());
});

test('connexion refusée pour un e-mail inconnu', async ({ api }) => {
  const response = await api.login('inconnu@example.com', 'mauvais-mot-de-passe');
  expect(response.status()).toBe(401);
  expect(await response.json()).toEqual({ error: 'Unauthorized' });
});

test('GET /users/me renvoie le profil du client, sans le mot de passe', async ({ api, customerToken }) => {
  const response = await api.getMe(customerToken);
  expect(response.status()).toBe(200);

  const body = await response.json();
  const profile = parseWithSchema(UserSchema, body);
  expect(profile.email).toBe(config.customer.email);
  expect(body).not.toHaveProperty('password');
});

test('GET /users/me sans jeton est refusé', async ({ api }) => {
  const response = await api.getMe();
  expect(response.status()).toBe(401);
});