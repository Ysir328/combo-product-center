import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useProfiles, useUpdateProfile } from '../../hooks/useProfiles';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import type { UserRole } from '../../types';
import { ROLE_LABELS } from '../../types';

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-700', operator: 'bg-blue-100 text-blue-700',
  advisor: 'bg-green-100 text-green-700', client: 'bg-purple-100 text-purple-700',
  visitor: 'bg-gray-100 text-gray-600',
};

export default function UserManage() {
  const { data: users, loading, refetch } = useProfiles();
  const { mutate: updateProfile, loading: updating } = useUpdateProfile();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [changing, setChanging] = useState<string | null>(null);

  const filtered = users.filter(u =>
    !search || u.name.includes(search) || (u.email && u.email.includes(search))
  );

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setChanging(userId);
    const ok = await updateProfile(userId, { role: newRole });
    if (ok) {
      showToast(`角色已更新为 ${ROLE_LABELS[newRole]}`, 'success');
      refetch();
    } else {
      showToast('更新失败', 'error');
    }
    setChanging(null);
  };

  if (loading) return <LoadingSpinner size="lg" text="加载用户列表..." />;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">用户权限管理</h2>
        <p className="text-sm text-gray-400 mt-1">管理用户账号、角色分配和权限控制</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" placeholder="搜索用户姓名或邮箱..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="Users" title="暂无用户" description={search ? '未找到匹配的用户' : '用户列表为空'} />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-4 px-6 font-medium text-gray-400">姓名</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-400">邮箱</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-400">角色</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-400">注册时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50/50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">{user.name.charAt(0)}</span>
                        </div>
                        <span className="font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-500">{user.email || '-'}</td>
                    <td className="py-4 px-6">
                      <select
                        value={user.role}
                        onChange={e => handleRoleChange(user.id, e.target.value as UserRole)}
                        disabled={changing === user.id}
                        className={`px-2 py-1 text-xs rounded-lg border-0 font-medium cursor-pointer ${ROLE_COLORS[user.role] || ''}`}
                      >
                        {Object.entries(ROLE_LABELS).map(([role, label]) => (
                          <option key={role} value={role}>{label}</option>
                        ))}
                      </select>
                      {changing === user.id && <Loader2 className="w-3 h-3 inline animate-spin ml-1" />}
                    </td>
                    <td className="py-4 px-6 text-gray-500">{new Date(user.createdAt).toLocaleDateString('zh-CN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
