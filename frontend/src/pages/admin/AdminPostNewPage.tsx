import { useNavigate } from 'react-router-dom';
import PostEditorForm from '../../components/admin/PostEditorForm';
import type { PostFormFields } from '../../components/admin/PostEditorForm';
import { adminApi } from '../../lib/adminApi';

export default function AdminPostNewPage() {
  const navigate = useNavigate();

  const handleCreatePost = async (data: PostFormFields) => {
    // Invoke create API
    await adminApi.createAdminPost(data);
    navigate('/admin/content');
  };

  return (
    <div className="max-w-4xl mx-auto py-4">
      <PostEditorForm onSubmit={handleCreatePost} titleLabel="새 게시물 작성" />
    </div>
  );
}
