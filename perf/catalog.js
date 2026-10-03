import http from 'k6/http';
import { check, sleep } from 'k6';

// The Toolshop API started with Docker Compose (never load test a public demo site)
const BASE_URL = 'http://localhost:8091';

export const options = {
  // Load profile: ramp up to 10 simultaneous visitors, hold, then ramp down
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '15s', target: 0 },
  ],
  // Pass/fail criteria: the run fails if one of them is not met
  thresholds: {
    http_req_failed: ['rate<0.01'], // fewer than 1 % of requests may fail
    http_req_duration: ['p(95)<200'], // 95 % of requests under 200 ms (measured baseline: p(95) = 54 ms)
    checks: ['rate>0.99'], // more than 99 % of checks must pass
  },
};

// Runs once before the test: collects the product ids the visitors will open
export function setup() {
  const response = http.get(`${BASE_URL}/products`);
  if (response.status !== 200) {
    throw new Error(`The product list is not available (status ${response.status})`);
  }
  return { productIds: response.json().data.map((product) => product.id) };
}

// Each iteration is one visitor browsing the catalog
export default function (data) {
  const list = http.get(`${BASE_URL}/products?page=1`, { tags: { name: 'product list' } });
  check(list, { 'product list: status 200': (r) => r.status === 200 });
  sleep(1);

  const productId = data.productIds[Math.floor(Math.random() * data.productIds.length)];
  const detail = http.get(`${BASE_URL}/products/${productId}`, { tags: { name: 'product detail' } });
  check(detail, { 'product detail: status 200': (r) => r.status === 200 });
  sleep(1);

  const search = http.get(`${BASE_URL}/products/search?q=pliers`, { tags: { name: 'product search' } });
  check(search, { 'product search: status 200': (r) => r.status === 200 });
  sleep(1);
}