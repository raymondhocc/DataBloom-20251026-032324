import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { AuthPage } from '@/pages/AuthPage';
export function HomePage() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <AuthPage />;
}