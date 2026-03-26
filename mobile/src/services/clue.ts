/**
 * Shh Me — Clue API service
 * Fetch clues, today's question, and answer a question.
 */
import { apiRequest } from './api';

export interface ShhClue {
  id: string;
  shh_id: string;
  type: 'text' | 'emoji' | 'location' | 'music' | 'habit';
  content: string;
  day: number;
  is_new: boolean;
  created_at: string;
}

export interface ClueQuestion {
  id: string;
  shh_id: string;
  text: string;
  day: number;
  answered: boolean;
  created_at: string;
}

interface AnswerResponse {
  clue_id: string;
  content: string;
  status: string;
}

export async function getClues(
  shhId: string,
  token: string,
): Promise<ShhClue[]> {
  return apiRequest<ShhClue[]>(`/shh/${shhId}/clues`, { token });
}

export async function getTodayQuestion(
  shhId: string,
  token: string,
): Promise<ClueQuestion | null> {
  return apiRequest<ClueQuestion | null>(`/shh/${shhId}/clues/question`, {
    token,
  });
}

export async function answerQuestion(
  shhId: string,
  answer: string,
  token: string,
): Promise<AnswerResponse> {
  return apiRequest<AnswerResponse>(`/shh/${shhId}/clues/answer`, {
    method: 'POST',
    body: { answer },
    token,
  });
}
