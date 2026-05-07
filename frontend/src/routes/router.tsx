import { createBrowserRouter } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import HomePage from '../pages/HomePage';
import GalleryPage from '../pages/GalleryPage';
import BlogPage from '../pages/BlogPage';
import StudyPage from '../pages/StudyPage';
import PostDetailPage from '../pages/PostDetailPage';
import ProfilePage from '../pages/ProfilePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import NotFoundPage from '../pages/NotFoundPage';

// Portfolio imports
import PortfolioPage from '../pages/portfolio/PortfolioPage';
import ResumePage from '../pages/portfolio/ResumePage';
import ShowcasePage from '../pages/portfolio/ShowcasePage';
import ShowcaseDetailPage from '../pages/portfolio/ShowcaseDetailPage';

// Admin imports
import AdminRouteGuard from '../components/admin/AdminRouteGuard';
import AdminLayout from '../components/admin/AdminLayout';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminPostsPage from '../pages/admin/AdminPostsPage';
import AdminPostNewPage from '../pages/admin/AdminPostNewPage';
import AdminPostEditPage from '../pages/admin/AdminPostEditPage';
import AdminMediaPage from '../pages/admin/AdminMediaPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminCommentsPage from '../pages/admin/AdminCommentsPage';
import AdminLayoutPage from '../pages/admin/AdminLayoutPage';
import AdminSchedulePage from '../pages/admin/AdminSchedulePage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';
import AdminPushPage from '../pages/admin/AdminPushPage';
import AdminProfilePage from '../pages/admin/AdminProfilePage';
import AdminPortfolioPage from '../pages/admin/AdminPortfolioPage';
import AdminShowcasePage from '../pages/admin/AdminShowcasePage';
import AdminShowcaseNewPage from '../pages/admin/AdminShowcaseNewPage';
import AdminShowcaseEditPage from '../pages/admin/AdminShowcaseEditPage';
import AdminSeoPage from '../pages/admin/AdminSeoPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { path: '', element: <HomePage /> },
      { path: 'gallery', element: <GalleryPage /> },
      { path: 'blog', element: <BlogPage /> },
      { path: 'study', element: <StudyPage /> },
      { path: 'post/:id', element: <PostDetailPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'portfolio', element: <PortfolioPage /> },
      { path: 'portfolio/resume', element: <ResumePage /> },
      { path: 'portfolio/showcase', element: <ShowcasePage /> },
      { path: 'portfolio/showcase/:slug', element: <ShowcaseDetailPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      {
        element: <AdminRouteGuard />,
        children: [
          {
            path: 'admin',
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminDashboardPage /> },
              { path: 'content', element: <AdminPostsPage /> },
              { path: 'content/new', element: <AdminPostNewPage /> },
              { path: 'content/:id/edit', element: <AdminPostEditPage /> },
              { path: 'media', element: <AdminMediaPage /> },
              { path: 'users', element: <AdminUsersPage /> },
              { path: 'comments', element: <AdminCommentsPage /> },
              { path: 'layout', element: <AdminLayoutPage /> },
              { path: 'schedule', element: <AdminSchedulePage /> },
              { path: 'settings', element: <AdminSettingsPage /> },
              { path: 'push', element: <AdminPushPage /> },
              { path: 'profile', element: <AdminProfilePage /> },
              { path: 'portfolio', element: <AdminPortfolioPage /> },
              { path: 'showcase', element: <AdminShowcasePage /> },
              { path: 'showcase/new', element: <AdminShowcaseNewPage /> },
              { path: 'showcase/:id/edit', element: <AdminShowcaseEditPage /> },
              { path: 'seo', element: <AdminSeoPage /> },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
