import { Upload, Search } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';

export default function ContentManage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">内容管理</h2>
          <p className="text-sm text-gray-400 mt-1">管理营销资料和内部文档的上传、版本控制和发布</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90">
          <Upload className="w-4 h-4" />
          上传资料
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索资料名称..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <EmptyState
        icon="FolderOpen"
        title="资料管理"
        description="在正式环境中，此处将展示所有资料的列表，支持分类筛选、版本管理、预览和批量操作。当前为MVP演示版本，资料数据已预置在系统中。"
      />
    </div>
  );
}
