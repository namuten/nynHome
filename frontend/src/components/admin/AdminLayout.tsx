import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-surface-container/10">
      <div className="flex">
        {/* Simple Sidebar placeholder */}
        <aside className="w-64 bg-surface p-6 border-r border-surface-container min-h-screen">
          <div className="text-xl font-display font-bold text-primary mb-8">CrocHub Admin</div>
          <nav className="space-y-2">
            <a href="/admin" className="block px-4 py-2 rounded-xl text-sm font-medium text-on-surface hover:bg-surface-container">Dashboard</a>
            <a href="/admin/content" className="block px-4 py-2 rounded-xl text-sm font-medium text-on-surface hover:bg-surface-container">Posts</a>
            <a href="/admin/media" className="block px-4 py-2 rounded-xl text-sm font-medium text-on-surface hover:bg-surface-container">Media</a>
            <a href="/admin/comments" className="block px-4 py-2 rounded-xl text-sm font-medium text-on-surface hover:bg-surface-container">Comments</a>
            <a href="/admin/users" className="block px-4 py-2 rounded-xl text-sm font-medium text-on-surface hover:bg-surface-container">Users</a>
          </nav>
        </aside>
        
        {/* Main Content Area */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
