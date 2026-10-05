import { randomUUID } from 'node:crypto';

// Unique suffix: two tests never create the same data
function uniqueSuffix(): string {
  return randomUUID().slice(0, 8);
}

export function newBrandData() {
  const suffix = uniqueSuffix();
  return { name: `QA Brand ${suffix}`, slug: `qa-brand-${suffix}` };
}

export function newCustomerData() {
  const suffix = uniqueSuffix();
  return {
    first_name: 'Test',
    last_name: 'Customer',
    email: `test.customer.${suffix}@example.com`,
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