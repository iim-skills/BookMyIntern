import React, { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full px-3.5 py-2.5 border rounded-lg bg-white text-sm text-text-primary transition-all duration-200 outline-none placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/10 min-h-[90px] resize-y ${
            error ? 'border-accent-rose focus:border-accent-rose focus:ring-accent-rose/10' : 'border-surface-mid'
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs font-semibold text-accent-rose mt-0.5">{error}</span>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export default Textarea;
