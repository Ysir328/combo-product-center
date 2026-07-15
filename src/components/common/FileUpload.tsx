import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { Upload, X, FileText, Loader2, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  accept?: string;
  maxSize?: number;
  bucket?: string;
  onUpload?: (file: File) => Promise<string | null>;
  onRemove?: () => void;
  currentFile?: string | null;
  label?: string;
  className?: string;
}

export default function FileUpload({
  accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png',
  maxSize = 50,
  onUpload,
  onRemove,
  currentFile,
  label = '拖拽文件到此处或点击选择',
  className = '',
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedPath, setUploadedPath] = useState<string | null>(currentFile || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (file.size > maxSize * 1024 * 1024) {
      setError(`文件大小不能超过 ${maxSize}MB`);
      return false;
    }
    setError(null);
    return true;
  };

  const simulateProgress = () => {
    setProgress(0);
    const timer = setInterval(() => {
      setProgress(prev => (prev >= 90 ? 90 : prev + Math.random() * 15));
    }, 200);
    return timer;
  };

  const handleFile = async (file: File) => {
    if (!validateFile(file)) return;
    setError(null);
    if (onUpload) {
      setUploading(true);
      const timer = simulateProgress();
      try {
        const path = await onUpload(file);
        clearInterval(timer);
        if (path) { setProgress(100); setUploadedPath(path); }
        else { setError('上传失败，请重试'); }
      } catch { setError('上传失败，请重试'); }
      setUploading(false);
    } else {
      setUploading(true);
      const timer = simulateProgress();
      setTimeout(() => { clearInterval(timer); setProgress(100); setUploadedPath(`demo/${file.name}`); setUploading(false); }, 1500);
    }
  };

  const handleDrop = (e: DragEvent) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); };
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); };
  const handleRemove = () => { setUploadedPath(null); setProgress(0); setError(null); onRemove?.(); };

  return (
    <div className={className}>
      {uploadedPath ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-green-600" />
            <div><p className="text-sm font-medium text-green-800">文件已上传</p><p className="text-xs text-green-600">{uploadedPath}</p></div>
          </div>
          <button onClick={handleRemove} className="p-1.5 rounded-lg hover:bg-green-100 text-green-600"><X className="w-4 h-4" /></button>
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragOver ? 'border-primary bg-primary-light/50' : uploading ? 'border-gray-200 bg-gray-50 pointer-events-none' : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'}`}
        >
          <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />
          {uploading ? (
            <div>
              <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-2">正在上传...</p>
              <div className="w-full max-w-[200px] mx-auto bg-gray-200 rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">{Math.round(progress)}%</p>
            </div>
          ) : error ? (
            <div>
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <p className="text-sm text-red-600 mb-1">上传出错</p><p className="text-xs text-red-400">{error}</p><p className="text-xs text-gray-400 mt-2">点击重试</p>
            </div>
          ) : (
            <div>
              <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-xs text-gray-400 mt-1">支持 {accept.split(',').join(', ')}，最大 {maxSize}MB</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
