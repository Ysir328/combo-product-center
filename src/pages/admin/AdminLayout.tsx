import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Settings, Package, FileText, CheckCircle, Users, BarChart3,
  ChevronRight, Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ADMIN_NAV = [
  { path: '/admin/products', label: '产品管理', icon: Package },
  { path: '/admin/content', label: '内容管理', icon: FileText },
  { path: '/admin/audit', label: '审核流程', icon: CheckCircle },
  { path: '/admin/users', label: '用户权限', icon: Users },
  { path: '/admin/logs', label: '操作日志', icon: BarChart3 },
];

export default function AdminLayout() {
  const { hasPermission } = useAuth();
  const location = useLocation();

  if (!hasPermission('internal:edit')) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">无访问权限</h2>
        <p className="text-gray-500">仅运营人员和系统管理员可访问管理后台。</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-gray-600">首页</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-600">管理后台</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <nav className="bg-white rounded-2xl border border-gray-100 p-3 sticky top-24">
            <div className="flex items-center gap-2 px-3 py-2 mb-2">
              <Settings className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-semibold text-gray-900">管理后台</span>
            </div>
            {ADMIN_NAV.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-primary-light text-primary font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <div className="lg:col-span-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
