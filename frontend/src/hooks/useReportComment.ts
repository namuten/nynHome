import { useMutation } from '@tanstack/react-query';
import { reportComment } from '../lib/reportsApi';
import type { ReportCommentPayload } from '../lib/reportsApi';

export function useReportComment(commentId: number) {
  return useMutation({
    mutationFn: (payload: ReportCommentPayload) => reportComment(commentId, payload),
  });
}
