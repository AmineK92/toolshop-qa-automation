import { test, expect } from '@playwright/test';

const CLIENT = {
  email: 'customer@practicesoftwaretesting.com',
  password: 'welcome01',
};

test('connexion réussie avec le compte client', async ({ request }) => {
  const response = await request.post('/users/login', { data: CLIENT });
  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body.access_token).toBeTruthy();
});

test('connexion refusée pour un e-mail inconnu', async ({ request }) => {
  const response = await request.post('/users/login', {
    data: { email: 'inconnu@example.com', password: 'mauvais-mot-de-passe' },
  });
  expect(response.status()).toBe(401);

  const body = await response.json();
  expect(body.error).toBe('Unauthorized');
});

test('GET /users/me renvoie le profil du client connecté', async ({ request }) => {
  const connexion = await request.post('/users/login', { data: CLIENT });
  const { access_token } = await connexion.json();

  const response = await request.get('/users/me', {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  expect(response.status()).toBe(200);

  const profil = await response.json();
  expect(profil.email).toBe(CLIENT.email);
});

test('GET /users/me sans jeton est refusé', async ({ request }) => {
  const response = await request.get('/users/me');
  expect(response.status()).toBe(401);
});