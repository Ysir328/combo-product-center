import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  open: boolean;
  onClose: () => void;
}

const TYPE_CONFIG: Record<
  string,
  { icon: React.FC<{ className?: string }>; container: string; iconColor: string }
> = {
  success: {
    icon: CheckCircle,
    container: 'bg-success/10 border-success/20',
    iconColor: 'text-success',
  },
  error: {
    icon: XCircle,
    container: 'bg-danger/10 border-danger/20',
    iconColor: 'text-danger',
  },
  warning: {
    icon: AlertTriangle,
    container: 'bg-warning/10 border-warning/20',
    iconColor: 'text-warning',
  },
  info: {
    icon: Info,
    container: 'bg-primary/10 border-primary/20',
    iconColor: 'text-primary',
  },
};

const Toast: React.FC<ToastProps> = ({ message, type = 'info', open, onClose }) => {
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [open, onClose]);

  if (!open) return null;

  const config = TYPE_CONFIG[type] || TYPE_CONFIG.info;
  const IconComponent = config.icon;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg
                   bg-white ${config.container} min-w-[300px] max-w-[420px]`}
      >
        <IconComponent className={`h-5 w-5 flex-shrink-0 ${config.iconColor}`} />
        <span className="text-sm font-medium text-gray-800 flex-1">{message}</span>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-0.5 rounded text-gray-400 hover:text-gray-600
                     hover:bg-gray-100 transition-colors"
          aria-label="关闭"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
