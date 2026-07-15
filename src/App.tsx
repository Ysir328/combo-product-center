import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import HomePage from './pages/home/HomePage';
import ProductListPage from './pages/product/ProductListPage';
import ProductDetailPage from './pages/product/ProductDetailPage';
import MarketingDashboard from './pages/marketing/MarketingDashboard';
import InternalDocList from './pages/internal/InternalDocList';
import InternalDocView from './pages/internal/InternalDocView';
import AdminLayout from './pages/admin/AdminLayout';
import ProductManage from './pages/admin/ProductManage';
import ContentManage from './pages/admin/ContentManage';
import AuditFlow from './pages/admin/AuditFlow';
import UserManage from './pages/admin/UserManage';
import LogViewer from './pages/admin/LogViewer';
import SearchResultsPage from './pages/search/SearchResultsPage';
import AnnouncementsPage from './pages/announcements/AnnouncementsPage';
import AuthPage from './pages/auth/AuthPage';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
      <p className="text-gray-500 mb-6">页面未找到</p>
      <a href="#/" className="text-primary hover:underline">
        返回首页
      </a>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <HashRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductListPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/marketing" element={<MarketingDashboard />} />
              <Route
                path="/internal"
                element={
                  <ProtectedRoute permission="internal:view">
                    <InternalDocList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/internal/:id"
                element={
                  <ProtectedRoute permission="internal:view">
                    <InternalDocView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute permission="internal:edit">
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<ProductManage />} />
                <Route path="products" element={<ProductManage />} />
                <Route path="content" element={<ContentManage />} />
                <Route path="audit" element={<AuditFlow />} />
                <Route path="users" element={<UserManage />} />
                <Route path="logs" element={<LogViewer />} />
              </Route>
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/announcements" element={<AnnouncementsPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </HashRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
