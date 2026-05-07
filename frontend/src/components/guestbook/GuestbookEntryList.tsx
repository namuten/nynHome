import { useState } from 'react';
import type { GuestbookEntry } from '../../lib/guestbookApi';
import { Flag, MessageSquareCode, Calendar } from 'lucide-react';
import ReportDialog from '../safety/ReportDialog';

interface GuestbookEntryListProps {
  entries: GuestbookEntry[];
  currentUserId: number | null;
}

export default function GuestbookEntryList({ entries, currentUserId }: GuestbookEntryListProps) {
  const [reportEntryId, setReportEntryId] = useState<number | null>(null);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-surface-container/10 border border-dashed border-surface-container rounded-3xl text-center font-body">
        <div className="p-4 bg-primary/5 text-primary rounded-full mb-4 animate-bounce">
          <MessageSquareCode className="w-8 h-8" />
        </div>
        <h4 className="text-base font-black text-on-surface mb-1">등록된 메시지가 없습니다</h4>
        <p className="text-xs text-on-surface-variant max-w-xs leading-relaxed">
          이 공간의 첫 소중한 방명록 주인공이 되어 보세요! 긍정과 응원의 격려 한마디를 남겨주세요. ✨
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-body">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {entries.map((entry) => {
          const isOwn = currentUserId === entry.userId;
          const userAvatar = entry.user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${entry.user.nickname}`;

          return (
            <div
              key={entry.id}
              className="bg-white border border-surface-container/60 hover:border-primary/20 hover:shadow-md transition-all rounded-3xl p-5 flex flex-col justify-between group animate-fade-in"
            >
              <div className="space-y-3">
                {/* User Info & Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={userAvatar}
                      alt={entry.user.nickname}
                      className="w-10 h-10 rounded-2xl object-cover ring-2 ring-surface-container"
                    />
                    <div>
                      <h4 className="text-sm font-black text-on-surface tracking-tight">
                        {entry.user.nickname}
                      </h4>
                      <div className="flex items-center gap-1 text-[10px] text-on-surface-variant mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(entry.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions (Flag) */}
                  {currentUserId && !isOwn && (
                    <button
                      onClick={() => setReportEntryId(entry.id)}
                      className="p-2 text-on-surface-variant hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="신고하기"
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Message Body */}
                <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap pl-1 font-medium">
                  {entry.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Modal */}
      <ReportDialog
        isOpen={reportEntryId !== null}
        targetType="guestbook"
        targetId={reportEntryId || 0}
        onClose={() => setReportEntryId(null)}
      />
    </div>
  );
}
