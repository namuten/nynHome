import api from './api';

export interface ReportCommentPayload {
  reason: 'spam' | 'harassment' | 'personal_info' | 'inappropriate' | 'other';
  description?: string;
}

export async function reportComment(commentId: number, payload: ReportCommentPayload) {
  const { data } = await api.post(`/comments/${commentId}/reports`, payload);
  return data;
}
