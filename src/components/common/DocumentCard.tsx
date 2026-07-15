import React from 'react';
import { Eye, Download } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface DocumentCardProps {
  title: string;
  description: string;
  format: string;
  fileSize: string;
  version: string;
  updateTime: string;
  status: string;
  tags?: string[];
  category?: string;
  onPreview?: () => void;
  onDownload?: () => void;
  showActions?: boolean;
}

const FORMAT_COLORS: Record<string, string> = {
  PDF: 'bg-danger/10 text-danger border-danger/20',
  pdf: 'bg-danger/10 text-danger border-danger/20',
  WORD: 'bg-primary/10 text-primary border-primary/20',
  word: 'bg-primary/10 text-primary border-primary/20',
  DOC: 'bg-primary/10 text-primary border-primary/20',
  DOCX: 'bg-primary/10 text-primary border-primary/20',
  EXCEL: 'bg-success/10 text-success border-success/20',
  excel: 'bg-success/10 text-success border-success/20',
  XLS: 'bg-success/10 text-success border-success/20',
  XLSX: 'bg-success/10 text-success border-success/20',
  PPT: 'bg-warning/10 text-warning border-warning/20',
  ppt: 'bg-warning/10 text-warning border-warning/20',
  PPTX: 'bg-warning/10 text-warning border-warning/20',
  IMAGE: 'bg-purple-100 text-purple-600 border-purple-200',
  image: 'bg-purple-100 text-purple-600 border-purple-200',
  PNG: 'bg-purple-100 text-purple-600 border-purple-200',
  JPG: 'bg-purple-100 text-purple-600 border-purple-200',
  JPEG: 'bg-purple-100 text-purple-600 border-purple-200',
};

const DocumentCard: React.FC<DocumentCardProps> = ({
  title,
  description,
  format,
  fileSize,
  version,
  updateTime,
  status,
  tags,
  category,
  onPreview,
  onDownload,
  showActions = true,
}) => {
  const formatStyle =
    FORMAT_COLORS[format] || 'bg-gray-100 text-gray-600 border-gray-200';

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 p-5
                 hover:shadow-md transition-shadow"
    >
      {/* Top row: format badge + status + category */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${formatStyle}`}
        >
          {format}
        </span>
        <StatusBadge status={status} type="document" />
        {category && (
          <span className="ml-auto text-xs text-gray-400">{category}</span>
        )}
      </div>

      {/* Title */}
      <h4 className="text-base font-bold text-gray-900 mb-1.5 line-clamp-1">{title}</h4>

      {/* Description */}
      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3">
        {description}
      </p>

      {/* Meta row */}
      <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
        <span>版本 {version}</span>
        <span className="w-px h-3 bg-gray-200" />
        <span>{fileSize}</span>
        <span className="w-px h-3 bg-gray-200" />
        <span>{updateTime}</span>
      </div>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-[10px] font-medium bg-gray-50 text-gray-500 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex gap-3 pt-3 border-t border-gray-50">
          {onPreview && (
            <button
              onClick={onPreview}
              className="flex items-center gap-1.5 text-xs font-medium text-primary
                         hover:text-primary/80 transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
              预览
            </button>
          )}
          {onDownload && (
            <button
              onClick={onDownload}
              className="flex items-center gap-1.5 text-xs font-medium text-primary
                         hover:text-primary/80 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              下载
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentCard;
