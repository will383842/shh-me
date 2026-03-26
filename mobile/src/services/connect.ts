/**
 * Shh Me — Connect (reveal) API service
 * Request mutual reveal, cancel, check status, get video.
 */
import { apiRequest } from './api';

export type ConnectStatus = 'none' | 'pending' | 'mutual' | 'cancelled';

export interface ConnectStatusResponse {
  status: ConnectStatus;
  phone: string | null;
  video_url: string | null;
  requested_at: string | null;
  connected_at: string | null;
}

export interface ConnectVideoResponse {
  url: string;
  duration_seconds: number;
  created_at: string;
}

export async function requestConnect(
  shhId: string,
  phone: string,
  token: string,
): Promise<ConnectStatusResponse> {
  return apiRequest<ConnectStatusResponse>(`/shh/${shhId}/connect`, {
    method: 'POST',
    body: { phone },
    token,
  });
}

export async function cancelConnect(
  shhId: string,
  token: string,
): Promise<ConnectStatusResponse> {
  return apiRequest<ConnectStatusResponse>(`/shh/${shhId}/connect/cancel`, {
    method: 'POST',
    token,
  });
}

export async function getConnectStatus(
  shhId: string,
  token: string,
): Promise<ConnectStatusResponse> {
  return apiRequest<ConnectStatusResponse>(`/shh/${shhId}/connect/status`, {
    token,
  });
}

export async function getConnectVideo(
  shhId: string,
  token: string,
): Promise<ConnectVideoResponse> {
  return apiRequest<ConnectVideoResponse>(`/shh/${shhId}/connect/video`, {
    token,
  });
}
