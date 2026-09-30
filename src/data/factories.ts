import { randomUUID } from 'node:crypto';

// Suffixe unique : deux tests ne créent jamais la même donnée
function uniqueSuffix(): string {
  return randomUUID().slice(0, 8);
}

export function newBrandData() {
  const suffix = uniqueSuffix();
  return { name: `Marque QA ${suffix}`, slug: `marque-qa-${suffix}` };
}

export function newCustomerData() {
  const suffix = uniqueSuffix();
  return {
    first_name: 'Client',
    last_name: 'QA',
    email: `client.qa.${suffix}@example.com`,
    password: `Qa-${suffix}-Test!9`,
    dob: '1990-01-01',
    phone: '5145550100',
    address: {
      street: 'Rue Sainte-Catherine',
      house_number: '100',
      city: 'Montréal',
      state: 'Québec',
      country: 'CA',
      postal_code: 'H2X 1Y4',
    },
  };
}

export type NewCustomer = ReturnType<typeof newCustomerData>;