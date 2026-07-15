import React from 'react';
import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  inbox: Inbox,
};

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  const IconComponent = icon && ICON_MAP[icon] ? ICON_MAP[icon] : Inbox;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-5">
        <IconComponent className="h-8 w-8 text-gray-300" />
      </div>
      <h4 className="text-base font-semibold text-gray-700 mb-1.5">{title}</h4>
      {description && (
        <p className="text-sm text-gray-400 mb-5 max-w-xs text-center">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
