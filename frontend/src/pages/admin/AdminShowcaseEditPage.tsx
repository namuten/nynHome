import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { getAdminShowcaseItem, updateShowcaseItem } from '../../lib/showcaseApi';
import ShowcaseEditorForm from '../../components/admin/ShowcaseEditorForm';
import type { ShowcaseItem } from '../../types/showcase';

export default function AdminShowcaseEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<ShowcaseItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const itemId = parseInt(id, 10);
        if (isNaN(itemId)) {
          setError('올바른 쇼케이스 ID가 아닙니다.');
          return;
        }
        const data = await getAdminShowcaseItem(itemId);
        setItem(data);
      } catch (err: any) {
        console.error(err);
        setError('작품 내용을 불러오지 못했습니다. 삭제되었거나 권한 만료일 수 있습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleEdit = async (data: any) => {
    if (!id) return;
    const itemId = parseInt(id, 10);
    await updateShowcaseItem(itemId, data);
    navigate('/admin/showcase');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 space-y-4">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-on-surface-variant font-medium">편집할 아카이브 데이터를 불러오고 있습니다...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-8 rounded-3xl max-w-md mx-auto text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
        <h3 className="text-sm font-black">작업 로드 실패</h3>
        <p className="text-xs">{error || '해당 정보를 찾을 수 없습니다.'}</p>
        <button
          type="button"
          onClick={() => navigate('/admin/showcase')}
          className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700"
        >
          목록으로 가기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4">
      <ShowcaseEditorForm
        titleLabel="✍️ 쇼케이스 아카이브 수정"
        initialValues={item}
        onSubmit={handleEdit}
      />
    </div>
  );
}
export { AdminShowcaseEditPage };
