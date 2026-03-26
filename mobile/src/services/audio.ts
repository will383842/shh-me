/**
 * Shh Me — Audio API service
 * Upload, send, and fetch audio messages for a shh.
 */
import { apiRequest } from './api';

export interface ShhAudio {
  id: string;
  shh_id: string;
  sender_id: string;
  duration_ms: number;
  filter: string;
  url: string;
  status: 'processing' | 'ready' | 'rejected';
  created_at: string;
}

interface UploadAudioResponse {
  id: string;
  upload_url: string;
  status: string;
}

export async function uploadAudio(
  shhId: string,
  uri: string,
  token: string,
): Promise<UploadAudioResponse> {
  return apiRequest<UploadAudioResponse>(`/shh/${shhId}/audio/upload`, {
    method: 'POST',
    body: { uri },
    token,
  });
}

export async function sendAudio(
  shhId: string,
  audioId: string,
  token: string,
): Promise<ShhAudio> {
  return apiRequest<ShhAudio>(`/shh/${shhId}/audio/${audioId}/send`, {
    method: 'POST',
    token,
  });
}

export async function getAudios(
  shhId: string,
  token: string,
): Promise<ShhAudio[]> {
  return apiRequest<ShhAudio[]>(`/shh/${shhId}/audio`, { token });
}
