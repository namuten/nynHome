import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

interface Props {
  className?: string;
}

export default function CommunityGuidelinesLink({ className = '' }: Props) {
  return (
    <Link 
      to="/community-guidelines" 
      target="_blank" 
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-primary hover:text-primary/80 hover:underline transition-colors ${className}`}
    >
      <span>커뮤니티 가이드라인</span>
      <ExternalLink className="w-3 h-3" />
    </Link>
  );
}
