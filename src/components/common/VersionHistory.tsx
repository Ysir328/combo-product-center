import React from 'react';

interface VersionEntry {
  version: string;
  date: string;
  author: string;
  changes: string;
}

interface VersionHistoryProps {
  versions: VersionEntry[];
}

const VersionHistory: React.FC<VersionHistoryProps> = ({ versions }) => {
  if (!versions || versions.length === 0) {
    return (
      <div className="text-center text-sm text-gray-400 py-8">暂无版本记录</div>
    );
  }

  return (
    <div className="space-y-0">
      {versions.map((v, index) => (
        <div
          key={v.version}
          className={`relative pl-6 py-4 ${
            index % 2 === 0 ? 'border-l-2 border-primary/30' : 'border-l-2 border-gray-100'
          } ${index !== versions.length - 1 ? 'pb-5' : ''}`}
        >
          {/* Dot */}
          <div
            className={`absolute left-0 top-5 -translate-x-1/2 w-2.5 h-2.5 rounded-full border-2 border-white ${
              index === 0 ? 'bg-primary' : 'bg-gray-200'
            }`}
          />

          {/* Content */}
          <div className="flex items-center gap-3 mb-1.5">
            <span className="text-sm font-bold text-gray-900">{v.version}</span>
            {index === 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded">
                最新
              </span>
            )}
            <span className="text-xs text-gray-400">{v.date}</span>
            <span className="text-xs text-gray-400">— {v.author}</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{v.changes}</p>
        </div>
      ))}
    </div>
  );
};

export default VersionHistory;
