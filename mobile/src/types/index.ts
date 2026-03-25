/**
 * Shh Me — Core type definitions
 */

export interface User {
  id: string;
  phone_hash: string;
  birth_year: number | null;
  locale: 'en' | 'fr';
  is_ghost: boolean;
  total_shh_sent: number;
  total_shh_received: number;
  push_token: string | null;
  created_at: string;
}

export interface Shh {
  id: string;
  sender_id: string;
  receiver_id: string;
  first_word: string | null;
  status: 'active' | 'revealed' | 'expired' | 'blocked';
  exchange_count: number;
  current_blur_level: number;
  bpm: number;
  expires_at: string;
  created_at: string;
  last_message_preview?: string;
  unread_count?: number;
  photo_url?: string;
}

export interface ShhMessage {
  id: string;
  shh_id: string;
  sender_id: string;
  content: string;
  type: 'text' | 'audio' | 'reaction';
  created_at: string;
  reaction?: string | null;
}

export interface ShhPhoto {
  id: string;
  shh_id: string;
  blur_level: number;
  url: string;
}

export interface QuickReply {
  id: string;
  text: string;
}

export interface SendShhPayload {
  receiver_phone_hash: string;
  first_word?: string;
  photo_uri?: string;
  blur_level?: number;
}

export interface GuessResult {
  correct: boolean;
  message: string;
  attempts_remaining: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  next_cursor: string | null;
}

export interface CommunityStats {
  count: number;
}

/** Navigation param list */
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  BirthYear: undefined;
  Home: undefined;
  SendShh: undefined;
  ShhDetail: { shhId: string };
  Settings: undefined;
};

/** Queued offline action */
export interface QueuedAction {
  id: string;
  type: 'send_shh' | 'send_message' | 'submit_guess';
  payload: Record<string, unknown>;
  createdAt: number;
}
