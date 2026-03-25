/**
 * Shh Me — Report API service
 */
import { apiRequest } from './api';

interface ReportResponse {
  id: string;
  status: string;
}

export async function submitReport(
  targetType: 'shh' | 'message' | 'user',
  targetId: string,
  reason: string,
  token: string,
): Promise<ReportResponse> {
  return apiRequest<ReportResponse>('/reports', {
    method: 'POST',
    body: { target_type: targetType, target_id: targetId, reason },
    token,
  });
}
