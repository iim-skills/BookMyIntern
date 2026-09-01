import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-3.5 text-text-muted flex items-center justify-center">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={`w-full py-2.5 border rounded-lg bg-white text-sm text-text-primary transition-all duration-200 outline-none placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/10 ${
              icon ? 'pl-10 pr-3.5' : 'px-3.5'
            } ${
              error ? 'border-accent-rose focus:border-accent-rose focus:ring-accent-rose/10' : 'border-surface-mid'
            } ${className}`}
            {...props}
          />
        </div>
        {error && <span className="text-xs font-semibold text-accent-rose mt-0.5">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
