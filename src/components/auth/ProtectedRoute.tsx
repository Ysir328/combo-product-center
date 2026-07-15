import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  permission?: string;
  children: ReactNode;
}

export default function ProtectedRoute({ permission, children }: ProtectedRouteProps) {
  const { isAuthenticated, loading, hasPermission } = useAuth();

  // Show loading while auth state is initializing
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="验证身份中..." />
      </div>
    );
  }

  // Redirect to auth page if not logged in
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Check permission if specified
  if (permission && !hasPermission(permission)) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0-8v4m0 0h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">无访问权限</h2>
        <p className="text-gray-500 mb-6">您的账号没有访问此页面的权限，请联系管理员。</p>
        <a href="#/" className="text-primary hover:underline">
          返回首页
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
