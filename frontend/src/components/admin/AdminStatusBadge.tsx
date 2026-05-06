interface AdminStatusBadgeProps {
  status: boolean | string;
  type?: 'published' | 'role' | 'category' | 'hidden';
}

export default function AdminStatusBadge({ status, type = 'published' }: AdminStatusBadgeProps) {
  const getStyles = () => {
    if (type === 'published') {
      return status
        ? { label: '게시됨', css: 'bg-green-50 text-green-700 border-green-200' }
        : { label: '임시저장', css: 'bg-zinc-100 text-zinc-600 border-zinc-200' };
    }

    if (type === 'role') {
      return status === 'admin'
        ? { label: '관리자', css: 'bg-primary/5 text-primary border-primary/20 font-black' }
        : { label: '일반회원', css: 'bg-surface-container/50 text-on-surface-variant border-surface-container' };
    }

    if (type === 'hidden') {
      return status
        ? { label: '숨김처리', css: 'bg-red-50 text-red-600 border-red-100' }
        : { label: '공개중', css: 'bg-blue-50 text-blue-600 border-blue-100' };
    }

    // Category mapping
    const categoryLabels: Record<string, string> = {
      creative: '창작 (Creative)',
      blog: '블로그 (Blog)',
      study: '학습 (Study)',
    };
    return {
      label: categoryLabels[String(status)] || String(status),
      css: 'bg-purple-50 text-purple-700 border-purple-200',
    };
  };

  const { label, css } = getStyles();

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg border text-[10px] font-bold select-none ${css}`}>
      {label}
    </span>
  );
}
