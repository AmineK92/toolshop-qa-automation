import * as dotenv from 'dotenv';

// Charge le fichier .env. Les variables déjà définies (en CI, par exemple) restent prioritaires.
dotenv.config({ quiet: true });

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variable d'environnement manquante : ${name}. Copie .env.example en .env.`);
  }
  return value;
}

export const config = {
  uiUrl: process.env.UI_URL ?? 'http://localhost:4200',
  apiUrl: process.env.API_URL ?? 'http://localhost:8091',
  customer: {
    email: requireEnv('CUSTOMER_EMAIL'),
    password: requireEnv('CUSTOMER_PASSWORD'),
  },
  admin: {
    email: requireEnv('ADMIN_EMAIL'),
    password: requireEnv('ADMIN_PASSWORD'),
  },
};