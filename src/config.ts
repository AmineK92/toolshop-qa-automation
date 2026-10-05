import * as dotenv from 'dotenv';

// Loads the .env file. Variables that are already defined (in CI, for example) take precedence.
dotenv.config({ quiet: true });

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}. Copy .env.example to .env.`);
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