import EmptyState from '../../components/common/EmptyState';

export default function UserManage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">用户权限管理</h2>
        <p className="text-sm text-gray-400 mt-1">管理用户账号、角色分配和权限控制</p>
      </div>
      <EmptyState
        icon="Users"
        title="用户管理"
        description="在正式环境中，此处将展示用户列表，支持角色分配、权限设置、账号启停和访问日志查询。当前为MVP演示版本。"
      />
    </div>
  );
}
