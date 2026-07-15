import { useState, useEffect } from 'react';
import { X, Download, Loader2, FileText, ExternalLink } from 'lucide-react';
import { getSignedUrl, getPublicUrl } from '../../lib/storage';

interface FilePreviewProps {
  open: boolean;
  onClose: () => void;
  bucket?: string;
  path?: string;
  format?: string;
  title?: string;
  signedUrl?: string;
}

export default function FilePreview({
  open,
  onClose,
  bucket,
  path,
  format,
  title = '文件预览',
  signedUrl: externalUrl,
}: FilePreviewProps) {
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState<string | null>(externalUrl || null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setLoading(true);
      setError(null);
      return;
    }

    if (externalUrl) {
      setUrl(externalUrl);
      setLoading(false);
      return;
    }

    if (!bucket || !path) {
      setError('无效的文件路径');
      setLoading(false);
      return;
    }

    const fetchUrl = async () => {
      setLoading(true);
      setError(null);
      try {
        const signed = await getSignedUrl(bucket as 'product-images' | 'marketing-files' | 'internal-files', path);
        if (signed) {
          setUrl(signed);
        } else {
          // Fallback to public URL
          const publicUrl = getPublicUrl(bucket as 'product-images' | 'marketing-files' | 'internal-files', path);
          setUrl(publicUrl);
        }
      } catch {
        setError('无法加载文件预览');
      }
      setLoading(false);
    };

    fetchUrl();
  }, [open, bucket, path, externalUrl]);

  if (!open) return null;

  const isPDF = format?.toLowerCase() === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(format?.toLowerCase() || '');
  const isOffice = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(format?.toLowerCase() || '');

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
          <p className="text-sm text-gray-500">加载预览中...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <FileText className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-sm text-gray-500 mb-2">{error}</p>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              在新窗口打开 <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      );
    }

    if (url) {
      if (isImage) {
        return (
          <div className="flex items-center justify-center min-h-96 bg-gray-100 rounded-lg">
            <img src={url} alt={title} className="max-w-full max-h-[70vh] object-contain" />
          </div>
        );
      }

      if (isPDF) {
        return (
          <iframe
            src={url}
            title={title}
            className="w-full h-[70vh] rounded-lg border-0"
          />
        );
      }

      if (isOffice) {
        const encodedUrl = encodeURIComponent(url);
        return (
          <>
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`}
              title={title}
              className="w-full h-[70vh] rounded-lg border-0"
            />
            <p className="text-xs text-gray-400 mt-2 text-center">
              Office 文件预览由 Microsoft Office Online 提供，如无法加载请下载后查看
            </p>
          </>
        );
      }

      // Generic iframe fallback
      return (
        <iframe
          src={url}
          title={title}
          className="w-full h-[70vh] rounded-lg border-0"
        />
      );
    }

    // No URL: show download prompt
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <FileText className="w-16 h-16 text-gray-200 mb-4" />
        <p className="text-sm text-gray-500 mb-4">无法在线预览此文件格式</p>
        <p className="text-xs text-gray-400">请下载文件后在本地查看</p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
            {format && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{format.toUpperCase()}</span>}
          </div>
          <div className="flex items-center gap-2">
            {url && !isImage && (
              <a
                href={url}
                download={title}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />下载
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
