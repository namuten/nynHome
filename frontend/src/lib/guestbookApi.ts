import { api } from './api';

export interface GuestbookUser {
  id: number;
  nickname: string;
  avatarUrl: string | null;
}

export interface GuestbookEntry {
  id: number;
  userId: number;
  body: string;
  isHidden: boolean;
  createdAt: string;
  user: GuestbookUser;
}

export interface FetchGuestbookResponse {
  items: GuestbookEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateGuestbookPayload {
  body: string;
}

export interface ReportGuestbookPayload {
  reason: 'spam' | 'harassment' | 'personal_info' | 'inappropriate' | 'other';
  description?: string;
}

export async function fetchGuestbookEntries(params: { page?: number; limit?: number } = {}): Promise<FetchGuestbookResponse> {
  const res = await api.get<FetchGuestbookResponse>('/guestbook', { params });
  return res.data;
}

export async function createGuestbookEntry(payload: CreateGuestbookPayload): Promise<GuestbookEntry> {
  const res = await api.post<GuestbookEntry>('/guestbook', payload);
  return res.data;
}

export async function reportGuestbookEntry(id: number, payload: ReportGuestbookPayload): Promise<any> {
  const res = await api.post(`/guestbook/${id}/reports`, payload);
  return res.data;
}
