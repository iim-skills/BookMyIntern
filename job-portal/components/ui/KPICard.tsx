import React from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  delta?: {
    value: string | number;
    isPositive: boolean;
  };
  className?: string;
}

export default function KPICard({ title, value, icon, delta, className = '' }: KPICardProps) {
  return (
    <div
      className={`bg-white border border-surface-mid rounded-card p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between gap-4 ${className}`}
    >
      <div className="flex-1 min-w-0">
        <div className="text-text-secondary text-[13px] font-medium leading-none mb-1.5 truncate">
          {title}
        </div>
        <div className="font-display font-extrabold text-2xl md:text-3xl text-text-primary leading-tight font-mono">
          {value}
        </div>
        {delta && (
          <div className="flex items-center gap-1 mt-1.5 text-xs font-semibold select-none">
            <span
              className={`inline-flex items-center gap-0.5 ${
                delta.isPositive ? 'text-accent-teal' : 'text-accent-rose'
              }`}
            >
              <span className="material-symbols-outlined text-sm font-bold">
                {delta.isPositive ? 'arrow_upward' : 'arrow_downward'}
              </span>
              {delta.value}
            </span>
            <span className="text-text-muted text-[10px] uppercase font-bold tracking-wider">vs last month</span>
          </div>
        )}
      </div>

      {icon && (
        <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center flex-shrink-0 border border-primary-light/50">
          {icon}
        </div>
      )}
    </div>
  );
}
