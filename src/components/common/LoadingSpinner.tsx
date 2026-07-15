import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const SIZE_MAP: Record<string, string> = {
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2
        className={`${SIZE_MAP[size]} text-primary animate-spin`}
      />
      {text && <p className="mt-3 text-sm text-gray-400">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
