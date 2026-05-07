import axios from 'axios';

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

// Global Axios configuration / helper
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function fetchGuestbookEntries(params: { page?: number; limit?: number } = {}): Promise<FetchGuestbookResponse> {
  const res = await axios.get('/api/guestbook', { params });
  return res.data;
}

export async function createGuestbookEntry(payload: CreateGuestbookPayload): Promise<GuestbookEntry> {
  const res = await axios.post('/api/guestbook', payload, {
    headers: getAuthHeaders(),
  });
  return res.data;
}

export async function reportGuestbookEntry(id: number, payload: ReportGuestbookPayload): Promise<any> {
  const res = await axios.post(`/api/guestbook/${id}/reports`, payload, {
    headers: getAuthHeaders(),
  });
  return res.data;
}
