import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, EyeOff, Eye, Trash2, Loader2 } from 'lucide-react';
import { useProducts, useUpdateProduct, useDeleteProduct } from '../../hooks/useProducts';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function ProductManage() {
  const { data: products, loading, refetch } = useProducts();
  const { mutate: updateProduct, loading: updating } = useUpdateProduct();
  const { mutate: deleteProduct, loading: deleting } = useDeleteProduct();
  const { showToast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    setToggling(id);
    const newStatus = currentStatus === 'online' ? 'paused' : 'online';
    const ok = await updateProduct(id, { status: newStatus as 'online' | 'paused' | 'offline' });
    if (ok) {
      showToast(`产品已${newStatus === 'online' ? '上架' : '下架'}`, 'success');
      refetch();
    } else {
      showToast('操作失败，请重试', 'error');
    }
    setToggling(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const ok = await deleteProduct(deleteTarget);
    if (ok) {
      showToast('产品已删除', 'success');
      refetch();
    } else {
      showToast('删除失败，请重试', 'error');
    }
    setDeleteTarget(null);
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="加载产品列表..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">产品管理</h2>
          <p className="text-sm text-gray-400 mt-1">管理产品信息的发布、编辑和下架</p>
        </div>
        <button
          onClick={() => showToast('新建产品：Supabase 模式下可用完整表单', 'info')}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />新建产品
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-4 px-6 font-medium text-gray-400">产品名称</th>
                <th className="text-left py-4 px-6 font-medium text-gray-400">类型</th>
                <th className="text-left py-4 px-6 font-medium text-gray-400">风险等级</th>
                <th className="text-left py-4 px-6 font-medium text-gray-400">状态</th>
                <th className="text-left py-4 px-6 font-medium text-gray-400">更新时间</th>
                <th className="text-right py-4 px-6 font-medium text-gray-400">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50/50">
                  <td className="py-4 px-6">
                    <Link to={`/products/${product.id}`} className="font-medium text-gray-900 hover:text-primary">
                      {product.name}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">{product.shortName}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-1 text-xs rounded-lg bg-gray-100 text-gray-600">{product.type}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 text-xs rounded-lg font-medium ${product.riskLevel === 'R4' || product.riskLevel === 'R5' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'}`}>
                      {product.riskLevel}
                    </span>
                  </td>
                  <td className="py-4 px-6"><StatusBadge status={product.status} type="product" /></td>
                  <td className="py-4 px-6 text-gray-500">{product.updateTime}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => showToast('编辑产品：Supabase 模式下可用完整表单', 'info')}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                        title="编辑"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(product.id, product.status)}
                        disabled={toggling === product.id}
                        className="p-2 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 disabled:opacity-50"
                        title={product.status === 'online' ? '下架' : '上架'}
                      >
                        {toggling === product.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : product.status === 'online' ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => setDeleteTarget(product.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="删除产品"
        message={`确定要删除此产品吗？此操作不可恢复。${!deleteTarget ? '' : '（Supabase 模式下永久删除）'}`}
        confirmLabel={deleting ? '删除中...' : '确认删除'}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  );
}
