import { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface GallerySlideshowProps {
  mediaUrls: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

export default function GallerySlideshow({
  mediaUrls,
  currentIndex,
  onIndexChange,
  onClose,
}: GallerySlideshowProps) {
  // 키보드 제어 (Left, Right, Escape) 연동
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && mediaUrls.length > 1) {
        onIndexChange((currentIndex + 1) % mediaUrls.length);
      }
      if (e.key === 'ArrowLeft' && mediaUrls.length > 1) {
        onIndexChange((currentIndex - 1 + mediaUrls.length) % mediaUrls.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // 모달 활성화 시 스크롤 비활성
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [currentIndex, mediaUrls, onIndexChange, onClose]);

  if (mediaUrls.length === 0) return null;

  const currentUrl = mediaUrls[currentIndex];

  // 동영상 MIME-Type 가벼운 검증용
  const isVideo =
    currentUrl.endsWith('.mp4') || currentUrl.endsWith('.webm') || currentUrl.endsWith('.mov');

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    onIndexChange((currentIndex - 1 + mediaUrls.length) % mediaUrls.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    onIndexChange((currentIndex + 1) % mediaUrls.length);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="갤러리 슬라이드쇼"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md select-none animate-fade-in font-body"
    >
      {/* 닫기 버턴 */}
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50 focus:outline-none focus:ring-2 focus:ring-white/50"
      >
        <X className="w-6 h-6" />
      </button>

      {/* 미디어 본체 프레임 */}
      <div
        className="relative max-w-5xl max-h-[85vh] w-full px-4 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 이전 화살표 */}
        {mediaUrls.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            aria-label="이전 미디어 보기"
            className="absolute left-6 p-3 bg-black/40 hover:bg-black/60 text-white/80 hover:text-white rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
        )}

        {/* 미디어 렌더러 (비디오 / 이미지) */}
        <div className="flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl bg-black/30">
          {isVideo ? (
            <video
              src={currentUrl}
              controls
              autoPlay
              className="max-w-full max-h-[75vh] object-contain rounded-xl"
            />
          ) : (
            <img
              src={currentUrl}
              alt={`쇼케이스 상세 이미지 ${currentIndex + 1}`}
              className="max-w-full max-h-[75vh] object-contain rounded-xl"
              draggable={false}
            />
          )}
        </div>

        {/* 다음 화살표 */}
        {mediaUrls.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            aria-label="다음 미디어 보기"
            className="absolute right-6 p-3 bg-black/40 hover:bg-black/60 text-white/80 hover:text-white rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        )}
      </div>

      {/* 하단 페이징 인디케이터 */}
      {mediaUrls.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/40 backdrop-blur text-xs font-semibold text-white/80 rounded-full select-none tracking-wider font-mono">
          {currentIndex + 1} / {mediaUrls.length}
        </div>
      )}
    </div>
  );
}
export { GallerySlideshow };
