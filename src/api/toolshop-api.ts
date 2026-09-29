import type { APIRequestContext, APIResponse } from '@playwright/test';

// Ajoute l'en-tête d'authentification uniquement si un jeton est fourni.
function authHeader(token?: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export class ToolshopApi {
  constructor(private readonly request: APIRequestContext) {}

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

  getProducts(): Promise<APIResponse> {
    return this.request.get('/products');
  }

  getMe(token?: string): Promise<APIResponse> {
    return this.request.get('/users/me', { headers: authHeader(token) });
  }
}