/**
 * Shh Me — Auth API service
 */
import { apiRequest } from './api';

interface AuthResponse {
  token: string;
  user_id: string;
  is_new: boolean;
}

export async function loginApple(identityToken: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/apple', {
    method: 'POST',
    body: { identity_token: identityToken },
  });
}

export async function loginGoogle(idToken: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/google', {
    method: 'POST',
    body: { id_token: idToken },
  });
}

export async function logout(token: string): Promise<void> {
  await apiRequest<void>('/auth/logout', {
    method: 'POST',
    token,
  });
}
