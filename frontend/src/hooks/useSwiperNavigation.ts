import { useEffect, useRef } from 'react';

export function useSwiperNavigation(
  onNext?: () => void,
  onPrev?: () => void,
  options: { threshold?: number } = {}
) {
  const { threshold = 50 } = options;
  const startXRef = useRef(0);
  const startYRef = useRef(0);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      startXRef.current = e.touches[0].clientX;
      startYRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 0) return;

      const deltaX = e.changedTouches[0].clientX - startXRef.current;
      const deltaY = e.changedTouches[0].clientY - startYRef.current;

      // X축으로의 이동 거리가 수평 제스처 기준치를 넘고, Y축 수직 스크롤 오차가 작을 때 동작
      if (Math.abs(deltaX) > threshold && Math.abs(deltaY) < threshold * 1.5) {
        if (deltaX < 0) {
          // 왼쪽으로 밀었을 때 -> 다음(Next) 콘텐츠
          if (onNext) onNext();
        } else {
          // 오른쪽으로 밀었을 때 -> 이전(Prev) 콘텐츠
          if (onPrev) onPrev();
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onNext, onPrev, threshold]);
}
