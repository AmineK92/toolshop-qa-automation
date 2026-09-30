import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { NewCustomer } from '../data/factories';

export type BrandInput = { name: string; slug: string };

// Ajoute l'en-tête d'authentification uniquement si un jeton est fourni.
function authHeader(token?: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export class ToolshopApi {
  constructor(private readonly request: APIRequestContext) {}

  // --- Authentification ---
  login(email: string, password: string): Promise<APIResponse> {
    return this.request.post('/users/login', { data: { email, password } });
  }

  async getToken(email: string, password: string): Promise<string> {
    const response = await this.login(email, password);
    if (!response.ok()) {
      throw new Error(`Connexion impossible pour ${email} (statut ${response.status()})`);
    }
    const body = await response.json();
    return body.access_token;
  }

  getMe(token?: string): Promise<APIResponse> {
    return this.request.get('/users/me', { headers: authHeader(token) });
  }

  // --- Produits ---
  getProducts(): Promise<APIResponse> {
    return this.request.get('/products');
  }

  // --- Marques ---
  createBrand(data: Partial<BrandInput>, token?: string): Promise<APIResponse> {
    return this.request.post('/brands', { data, headers: authHeader(token) });
  }

  getBrand(id: string): Promise<APIResponse> {
    return this.request.get(`/brands/${id}`);
  }

  updateBrand(id: string, data: Partial<BrandInput>): Promise<APIResponse> {
    return this.request.put(`/brands/${id}`, { data });
  }

  deleteBrand(id: string, token?: string): Promise<APIResponse> {
    return this.request.delete(`/brands/${id}`, { headers: authHeader(token) });
  }

  // --- Utilisateurs ---
  registerUser(data: NewCustomer): Promise<APIResponse> {
    return this.request.post('/users/register', { data });
  }

  getUser(id: string, token: string): Promise<APIResponse> {
    return this.request.get(`/users/${id}`, { headers: authHeader(token) });
  }

  listUsers(token: string): Promise<APIResponse> {
    return this.request.get('/users', { headers: authHeader(token) });
  }

  patchUser(id: string, data: Record<string, unknown>, token: string): Promise<APIResponse> {
    return this.request.patch(`/users/${id}`, { data, headers: authHeader(token) });
  }

  deleteUser(id: string, token: string): Promise<APIResponse> {
    return this.request.delete(`/users/${id}`, { headers: authHeader(token) });
  }

  // --- Invoices ---
  getInvoices(token: string): Promise<APIResponse> {
    return this.request.get('/invoices', { headers: authHeader(token) });
  }
}