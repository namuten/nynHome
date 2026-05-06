import { Link } from 'react-router-dom';
import type { PostSummary } from '../../types/api';

interface PostCardProps {
  post: PostSummary;
}

export default function PostCard({ post }: PostCardProps) {
  const getCategoryStyles = (cat: string) => {
    switch (cat) {
      case 'creative':
        return {
          bg: 'bg-secondary/10 text-secondary border-secondary/20',
          gradient: 'from-secondary-container/30 to-primary-container/20',
          label: 'Creative',
        };
      case 'blog':
        return {
          bg: 'bg-primary/10 text-primary border-primary/20',
          gradient: 'from-primary-container/30 to-secondary-container/20',
          label: 'Blog',
        };
      case 'study':
      default:
        return {
          bg: 'bg-tertiary/10 text-tertiary border-tertiary/20',
          gradient: 'from-emerald-50 to-teal-50',
          label: 'Study',
        };
    }
  };

  const styles = getCategoryStyles(post.category);
  const formattedDate = new Date(post.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link
      to={`/post/${post.id}`}
      className="group block rounded-3xl bg-white border border-surface-container overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Thumbnail Area */}
      <div className="aspect-[16/10] w-full relative overflow-hidden bg-surface-container">
        {post.thumbnailUrl ? (
          <img
            src={post.thumbnailUrl}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-tr ${styles.gradient} flex items-center justify-center`}>
            <span className="text-4xl font-display font-extrabold text-primary-container/20 select-none">
              CrocHub
            </span>
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${styles.bg}`}>
            {styles.label}
          </span>
        </div>
      </div>

      {/* Body Area */}
      <div className="p-6 space-y-3">
        <h3 className="text-lg font-display font-bold text-on-surface line-clamp-2 group-hover:text-primary transition duration-200">
          {post.title}
        </h3>
        <div className="flex items-center justify-between text-xs text-on-surface-variant font-body font-medium">
          <span>{formattedDate}</span>
          <div className="flex items-center space-x-2">
            <span>조회수 {post.viewCount}</span>
            {post.commentCount !== undefined && post.commentCount > 0 && (
              <>
                <span>•</span>
                <span className="text-primary font-semibold">댓글 {post.commentCount}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
