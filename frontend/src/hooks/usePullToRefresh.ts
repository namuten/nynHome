import { useEffect, useState, useRef } from 'react';

interface PullToRefreshOptions {
  threshold?: number;
  resistance?: number;
}

export function usePullToRefresh(
  onRefresh: () => Promise<void>,
  options: PullToRefreshOptions = {}
) {
  const { threshold = 80, resistance = 2.5 } = options;

  const [pullOffset, setPullOffset] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [readyToRefresh, setReadyToRefresh] = useState(false);

  const startYRef = useRef(0);
  const pullingRef = useRef(false);

  useEffect(() => {
    // 윈도우 스크롤 상태 체크 헬퍼
    const getScrollTop = () => {
      return window.scrollY || document.documentElement.scrollTop;
    };

    const handleTouchStart = (e: TouchEvent) => {
      // 오직 스크롤이 맨 위에 있을 때만 당김 제스처를 시동
      if (getScrollTop() <= 0 && !isRefreshing) {
        startYRef.current = e.touches[0].clientY;
        pullingRef.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!pullingRef.current || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startYRef.current;

      // 아래로 당길 때만 계산
      if (deltaY > 0) {
        // 감쇄 작용(저항)을 주어 부드럽게 미끄러지도록 제어
        const offset = Math.min(deltaY / resistance, threshold * 1.5);
        setPullOffset(offset);

        if (offset >= threshold) {
          setReadyToRefresh(true);
        } else {
          setReadyToRefresh(false);
        }

        // 브라우저 기본 당겨서 새로고침(오버스크롤) 모션 가드 차단
        if (deltaY > 10 && e.cancelable) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = async () => {
      if (!pullingRef.current) return;
      pullingRef.current = false;

      if (readyToRefresh && !isRefreshing) {
        setIsRefreshing(true);
        // 부드럽게 로딩 영역에 안착 (threshold 높이로 유지)
        setPullOffset(threshold);

        try {
          await onRefresh();
        } catch (err) {
          console.error('⚠️ Pull to Refresh failed:', err);
        } finally {
          setIsRefreshing(false);
          setReadyToRefresh(false);
          // 안심 릴리즈 (원상복구 애니메이션)
          setPullOffset(0);
        }
      } else {
        // 임계값 미달 시 자연스럽게 리셋
        setPullOffset(0);
        setReadyToRefresh(false);
      }
    };

    // passive: true 옵션을 주어 부드러운 스크롤 스펙 충족, 단 preventDefault가 들어가는 Move 이벤트는 passive: false로 지정해 호환성 유지
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh, threshold, resistance, readyToRefresh, isRefreshing]);

  return { pullOffset, isRefreshing, readyToRefresh };
}
