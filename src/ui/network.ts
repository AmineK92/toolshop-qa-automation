import type { Route } from '@playwright/test';
import { config } from '../config';

const apiOrigin = new URL(config.apiUrl).origin;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, QUERY, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
};

// Matches the requests the front end sends to one API path, e.g. '/products/search'
export function apiPath(path: string): (url: URL) => boolean {
  return (url) => url.origin === apiOrigin && url.pathname === path;
}

// Answers an intercepted API call with a server error (HTTP 500)
export async function serverError(route: Route): Promise<void> {
  // The front end and the API run on different ports, so the browser first sends
  // a CORS preflight (OPTIONS): approve it, then fail the real request
  if (route.request().method() === 'OPTIONS') {
    await route.fulfill({ status: 204, headers: corsHeaders });
    return;
  }
  await route.fulfill({ status: 500, headers: corsHeaders, json: { message: 'Simulated server error' } });
}