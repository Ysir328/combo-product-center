import React from 'react';
import { X } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterGroup {
  key: string;
  label: string;
  options: FilterOption[];
}

interface FilterPanelProps {
  filters: FilterGroup[];
  activeFilters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClearAll: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  activeFilters,
  onFilterChange,
  onClearAll,
}) => {
  const hasAnyActive = Object.values(activeFilters).some((v) => v !== '' && v !== undefined);

  return (
    <div className="flex items-center gap-6 flex-wrap">
      {filters.map((group) => (
        <div key={group.key} className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
            {group.label}:
          </span>
          <div className="flex gap-1.5 flex-wrap">
            {group.options.map((option) => {
              const isActive = activeFilters[group.key] === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() =>
                    onFilterChange(group.key, isActive ? '' : option.value)
                  }
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-all
                    ${
                      isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {hasAnyActive && (
        <button
          onClick={onClearAll}
          className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-400
                     hover:text-gray-600 transition-colors"
        >
          <X className="h-3 w-3" />
          清除筛选
        </button>
      )}
    </div>
  );
};

export default FilterPanel;
