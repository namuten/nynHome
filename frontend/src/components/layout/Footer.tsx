import { Link } from 'react-router-dom';
import { Shield, Lock, MessageSquare } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-surface-container py-8 mt-auto font-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand Logo */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-display font-black tracking-wider text-primary/60">
            CROC<span className="text-secondary/60">HUB</span>
          </span>
          <span className="text-[10px] text-on-surface-variant/40 font-mono">
            v1.2.0
          </span>
        </div>

        {/* Policy Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-on-surface-variant">
          <Link
            to="/guestbook"
            className="flex items-center gap-1.5 hover:text-primary transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>방명록</span>
          </Link>
          <Link
            to="/community-guidelines"
            className="flex items-center gap-1.5 hover:text-red-500 transition-colors"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>커뮤니티 수칙</span>
          </Link>
          <Link
            to="/privacy-safety"
            className="flex items-center gap-1.5 hover:text-blue-500 transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>개인정보 & 보안</span>
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-[11px] text-on-surface-variant/50 font-mono">
          &copy; 2026 CrocHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
