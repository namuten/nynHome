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
import AdminPlaceholderPage from '../pages/AdminPlaceholderPage';
import NotFoundPage from '../pages/NotFoundPage';

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
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'admin', element: <AdminPlaceholderPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
