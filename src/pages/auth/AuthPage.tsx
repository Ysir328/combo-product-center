import { useNavigate } from 'react-router-dom';
import { Shield, User, Users, UserCog, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS, ROLE_PERMISSIONS } from '../../types';
import type { UserRole } from '../../types';

const ROLE_ICONS: Record<UserRole, typeof Shield> = {
  visitor: User,
  client: Users,
  advisor: UserCog,
  operator: LayoutDashboard,
  admin: Shield,
};

export default function AuthPage() {
  const { user, switchRole, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-primary-light rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">角色切换（演示模式）</h1>
        <p className="text-sm text-gray-400 mt-2">
          当前角色：<span className="font-medium text-gray-700">{user?.name}</span>
        </p>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 gap-3 mb-8">
        {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => {
          const Icon = ROLE_ICONS[role];
          const isActive = user?.role === role;
          const perms = ROLE_PERMISSIONS[role];
          return (
            <button
              key={role}
              onClick={() => switchRole(role)}
              className={`text-left p-5 rounded-2xl border-2 transition-all ${
                isActive
                  ? 'border-primary bg-primary-light/50 shadow-sm'
                  : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{ROLE_LABELS[role]}</h3>
                    {isActive && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-white">当前</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    权限：{perms.includes('*') ? '全部权限' : perms.join('、')}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90"
        >
          返回首页
        </button>
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50"
        >
          <LogOut className="w-4 h-4" />
          退出登录
        </button>
      </div>

      <div className="mt-10 bg-gray-50 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">角色使用说明</h3>
        <ul className="space-y-2 text-sm text-gray-500">
          <li>• <strong>访客/客户</strong>：可浏览产品介绍和营销数据，无法查看内部资料</li>
          <li>• <strong>投顾经理</strong>：可查看全部内容，包括内部资料和管理后台</li>
          <li>• <strong>运营人员</strong>：可管理内容，上传/编辑资料，提交审核</li>
          <li>• <strong>系统管理员</strong>：拥有全部权限，可管理用户和系统配置</li>
        </ul>
      </div>
    </div>
  );
}
