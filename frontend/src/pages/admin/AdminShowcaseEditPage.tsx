import { useParams } from 'react-router-dom';

/**
 * 작품 수정 관리자 페이지 (임시 자리표시자)
 */
export default function AdminShowcaseEditPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-on-surface">작품 정보 수정</h1>
        <p className="text-sm text-on-surface-variant font-body">작품 쇼케이스 내용을 변경하고 연동된 미디어를 편집합니다.</p>
      </div>
      <div className="bg-surface border border-outline-variant rounded-2xl p-8 text-center space-y-4">
        <p className="text-sm text-on-surface-variant">작품 ID: <strong>{id}</strong> 수정 폼은 개발 예정입니다.</p>
      </div>
    </div>
  );
}
