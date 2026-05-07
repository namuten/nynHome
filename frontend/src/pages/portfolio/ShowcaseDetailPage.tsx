import { useParams } from 'react-router-dom';

/**
 * 작품 상세 페이지 (임시 자리표시자)
 */
export default function ShowcaseDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
      <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl mx-auto flex items-center justify-center text-2xl font-bold">
        🔍
      </div>
      <h1 className="text-3xl font-display font-bold text-on-surface">작품 상세</h1>
      <p className="text-sm text-on-surface-variant font-body max-w-md mx-auto leading-relaxed">
        슬러그: <strong>{slug}</strong><br />
        해당 작품의 미디어 갤러리 슬라이드쇼, 오디오 플레이어 연동 및 세부 마크다운 컨텐츠를 볼 수 있는 상세 페이지입니다.
      </p>
    </div>
  );
}
