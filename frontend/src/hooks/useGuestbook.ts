import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchGuestbookEntries,
  createGuestbookEntry,
  reportGuestbookEntry,
} from '../lib/guestbookApi';
import type {
  CreateGuestbookPayload,
  ReportGuestbookPayload,
} from '../lib/guestbookApi';

export function useGuestbookEntries(page: number, limit: number = 20) {
  return useQuery({
    queryKey: ['guestbook', 'list', page, limit],
    queryFn: () => fetchGuestbookEntries({ page, limit }),
    placeholderData: (previousData) => previousData, // smooth pagination transitions
  });
}

export function useCreateGuestbookEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGuestbookPayload) => createGuestbookEntry(payload),
    onSuccess: () => {
      // Invalidate guestbook list to trigger re-fetch and show new post immediately
      queryClient.invalidateQueries({ queryKey: ['guestbook', 'list'] });
    },
  });
}

export function useReportGuestbookEntry() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ReportGuestbookPayload }) =>
      reportGuestbookEntry(id, payload),
  });
}
