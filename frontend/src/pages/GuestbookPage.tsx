import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useGuestbookEntries } from '../hooks/useGuestbook';
import GuestbookEntryForm from '../components/guestbook/GuestbookEntryForm';
import GuestbookEntryList from '../components/guestbook/GuestbookEntryList';
import { MessageSquare, ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CommunityGuidelinesLink from '../components/safety/CommunityGuidelinesLink';

export default function GuestbookPage() {
  const [page, setPage] = useState(1);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const limit = 10;
  const { data, isLoading, isError, error } = useGuestbookEntries(page, limit);

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const handleNextPage = () => {
    if (data && page < data.totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10 font-body animate-fade-in">
      {/* Premium Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-green-600/90 to-emerald-800/90 text-white p-8 sm:p-10 shadow-lg border border-green-500/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -ml-20 -mb-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-black tracking-wider uppercase border border-white/10">
              <MessageSquare className="w-3.5 h-3.5 text-green-300" />
              <span>CrocHub Guestbook</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight leading-none">
              방명록 & 응원 보드
            </h1>
            <p className="text-xs sm:text-sm text-green-100 font-medium leading-relaxed">
              크록허브에 방문해 주셔서 감사합니다! 개발자들과 커뮤니티 동료들에게 따뜻한 응원의 한마디, 발전적인 피드백을 자유롭게 남겨주세요.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
            <BookOpen className="w-5 h-5 text-green-300 shrink-0" />
            <div className="text-xs">
              <span className="block font-black text-white">커뮤니티를 소중히 가꿔주세요</span>
              <span className="block text-green-100/80 mt-0.5">
                안전을 위해 작성 시 <CommunityGuidelinesLink className="text-xs font-bold underline text-green-300 hover:text-green-200" />이 적용됩니다.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Guestbook Entry Form Section */}
      <div>
        <GuestbookEntryForm
          isAuthenticated={isAuthenticated}
          onLoginClick={handleLoginRedirect}
        />
      </div>

      {/* Message List Grid Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-surface-container pb-4">
          <h2 className="text-lg font-black text-on-surface tracking-tight flex items-center gap-2">
            <span>남겨진 격려들</span>
            {data && (
              <span className="px-2.5 py-0.5 bg-surface-container text-on-surface-variant text-xs font-bold rounded-full">
                {data.total}
              </span>
            )}
          </h2>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-xs text-on-surface-variant font-medium">따뜻한 방명록 메시지들을 불러오는 중...</p>
          </div>
        ) : isError ? (
          <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-center text-sm font-medium">
            방명록 목록을 가져오지 못했습니다. ({error instanceof Error ? error.message : '알 수 없는 오류'})
          </div>
        ) : (
          <>
            <GuestbookEntryList
              entries={data?.items || []}
              currentUserId={user?.id || null}
            />

            {/* Pagination controls */}
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-surface-container pt-6">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-surface-container bg-white text-on-surface hover:bg-surface-container/30 active:scale-95 disabled:scale-100 disabled:opacity-40 transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>이전 페이지</span>
                </button>

                <span className="text-xs font-bold text-on-surface-variant">
                  {page} / {data.totalPages} 페이지
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={page === data.totalPages}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-surface-container bg-white text-on-surface hover:bg-surface-container/30 active:scale-95 disabled:scale-100 disabled:opacity-40 transition-all"
                >
                  <span>다음 페이지</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
