import React from 'react';

interface SkeletonCardProps {
  className?: string;
  variant?: 'card' | 'line' | 'circle';
}

export default function SkeletonCard({ className = '', variant = 'card' }: SkeletonCardProps) {
  if (variant === 'line') {
    return <div className={`h-4 rounded shimmer bg-surface-mid w-full ${className}`} />;
  }

  if (variant === 'circle') {
    return <div className={`rounded-full shimmer bg-surface-mid ${className}`} />;
  }

  return (
    <div
      className={`bg-white border border-surface-mid rounded-card p-5 shadow-sm flex flex-col gap-4 ${className}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-surface-mid shimmer flex-shrink-0" />
          <div className="flex flex-col gap-1.5 w-32">
            <div className="h-4 rounded bg-surface-mid shimmer w-full" />
            <div className="h-3 rounded bg-surface-mid shimmer w-2/3" />
          </div>
        </div>
        <div className="h-5 w-16 rounded bg-surface-mid shimmer" />
      </div>

      <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
        <div className="h-3 rounded bg-surface-mid shimmer w-full" />
        <div className="h-3 rounded bg-surface-mid shimmer w-5/6" />
      </div>

      <div className="flex justify-between items-center pt-2">
        <div className="h-4 rounded bg-surface-mid shimmer w-20" />
        <div className="h-7 w-24 rounded bg-surface-mid shimmer" />
      </div>
    </div>
  );
}
