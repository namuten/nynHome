import { useNavigate } from 'react-router-dom';
import { createShowcaseItem } from '../../lib/showcaseApi';
import ShowcaseEditorForm from '../../components/admin/ShowcaseEditorForm';

export default function AdminShowcaseNewPage() {
  const navigate = useNavigate();

  const handleCreate = async (data: any) => {
    await createShowcaseItem(data);
    navigate('/admin/showcase');
  };

  return (
    <div className="max-w-4xl mx-auto py-4">
      <ShowcaseEditorForm
        titleLabel="✨ 신규 쇼케이스 작품 등록"
        onSubmit={handleCreate}
      />
    </div>
  );
}
export { AdminShowcaseNewPage };
