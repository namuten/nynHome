import React, { useState, useEffect, useRef } from 'react';
import { getOptimizedImageUrl, getMediaSrcSet } from '../../lib/media';
import type { MediaItem } from '../../types/api';

interface OptimizedImageProps {
  media: MediaItem | any | null | undefined;
  alt?: string;
  className?: string;
  sizes?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  media,
  alt = '크록허브 이미지',
  className = 'w-full h-auto object-cover',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isDataSaver, setIsDataSaver] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // 1. 저대역폭 (Data Saver) 감지 및 네트워크 상태 검수
  useEffect(() => {
    const conn = (navigator as any).connection;
    if (conn) {
      const isSlow = conn.effectiveType === '2g' || conn.effectiveType === '3g' || conn.effectiveType === 'slow-2g';
      const isSaveData = conn.saveData === true;
      if (isSlow || isSaveData) {
        setIsDataSaver(true);
      }
    }
  }, []);

  // 2. Intersection Observer 기반으로 레이지 로드 가동
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect(); // 로딩 개시 후 관찰 종료
        }
      },
      { rootMargin: '120px' } // 120px 전방 통과 감지
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!media) return null;

  // 저대역폭 환경일 경우, 고해상도를 억제하고 중간 규격(thumb_medium)만 즉각 픽킹
  const mainSrc = isDataSaver 
    ? getOptimizedImageUrl(media, 'thumb_medium') 
    : getOptimizedImageUrl(media, 'web_optimized');

  // 초저해상도 블러 플레이스홀더 획득 (LQIP 대용)
  const placeholderSrc = getOptimizedImageUrl(media, 'thumb_small');
  const srcSet = isDataSaver ? '' : getMediaSrcSet(media);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-slate-900/50 ${className}`}
    >
      {/* 3. 로딩 전 Blur 필터를 입힌 초소형 LQIP 플레이스홀더 */}
      {!isLoaded && placeholderSrc && (
        <img
          src={placeholderSrc}
          alt="Loading..."
          className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-70 transition-opacity duration-300 pointer-events-none"
        />
      )}

      {/* 4. 점진적 레이지 로딩 원본 이미지 */}
      {isInView && (
        <picture>
          {/* WebP 소스를 최우선으로 제안 (만약 파생 파일이 webp인 경우 대응) */}
          {srcSet && (
            <source
              srcSet={srcSet}
              sizes={sizes}
              type="image/webp"
            />
          )}
          <img
            src={mainSrc}
            srcSet={srcSet || undefined}
            sizes={sizes}
            loading="lazy"
            decoding="async"
            alt={alt}
            onLoad={() => setIsLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-700 ease-out ${
              isLoaded 
                ? 'opacity-100 blur-0 scale-100' 
                : 'opacity-0 blur-md scale-102'
            }`}
          />
        </picture>
      )}
    </div>
  );
};

export default OptimizedImage;
