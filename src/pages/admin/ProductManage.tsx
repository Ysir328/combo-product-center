import { useState } from 'react';
import { Plus, Edit2, EyeOff, MoreHorizontal } from 'lucide-react';
import { products } from '../../data/products';
import StatusBadge from '../../components/common/StatusBadge';

export default function ProductManage() {
  const [productList] = useState(products);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">产品管理</h2>
          <p className="text-sm text-gray-400 mt-1">管理产品信息的发布、编辑和下架</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          新建产品
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
              {productList.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50">
                  <td className="py-4 px-6">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{product.shortName}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-1 text-xs rounded-lg bg-gray-100 text-gray-600">
                      {product.type}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 text-xs rounded-lg font-medium ${
                      product.riskLevel === 'R4' || product.riskLevel === 'R5'
                        ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'
                    }`}>
                      {product.riskLevel}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={product.status} type="product" />
                  </td>
                  <td className="py-4 px-6 text-gray-500">{product.updateTime}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {product.status === 'online' && (
                        <button className="p-2 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600">
                          <EyeOff className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
