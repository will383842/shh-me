/**
 * Shh Me — Shh API service
 */
import { apiRequest } from './api';
import type {
  Shh,
  ShhMessage,
  ShhPhoto,
  SendShhPayload,
  GuessResult,
  QuickReply,
  PaginatedResponse,
} from '../types';

export async function sendShh(
  data: SendShhPayload,
  token: string,
): Promise<Shh> {
  return apiRequest<Shh>('/shh', {
    method: 'POST',
    body: data,
    token,
  });
}

export async function getShhList(
  token: string,
  cursor?: string,
): Promise<PaginatedResponse<Shh>> {
  const query = cursor ? `?cursor=${cursor}` : '';
  return apiRequest<PaginatedResponse<Shh>>(`/shh${query}`, { token });
}

export async function getShhDetail(
  id: string,
  token: string,
): Promise<Shh> {
  return apiRequest<Shh>(`/shh/${id}`, { token });
}

export async function sendMessage(
  shhId: string,
  content: string,
  token: string,
): Promise<ShhMessage> {
  return apiRequest<ShhMessage>(`/shh/${shhId}/messages`, {
    method: 'POST',
    body: { content },
    token,
  });
}

export async function getPhoto(
  shhId: string,
  token: string,
): Promise<ShhPhoto> {
  return apiRequest<ShhPhoto>(`/shh/${shhId}/photo`, { token });
}

export async function submitGuess(
  shhId: string,
  identifier: string,
  token: string,
): Promise<GuessResult> {
  return apiRequest<GuessResult>(`/shh/${shhId}/guess`, {
    method: 'POST',
    body: { identifier },
    token,
  });
}

export async function getQuickReplies(
  shhId: string,
  token: string,
): Promise<QuickReply[]> {
  return apiRequest<QuickReply[]>(`/shh/${shhId}/quick-replies`, { token });
}
