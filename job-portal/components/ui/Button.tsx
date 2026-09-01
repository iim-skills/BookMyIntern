import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyle =
    'inline-flex items-center justify-center font-body font-semibold rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] outline-none focus:ring-2 focus:ring-primary/20';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark shadow-sm border border-transparent',
    secondary: 'bg-surface-mid text-text-primary hover:bg-surface-mid/85 border border-transparent',
    outline: 'border-2 border-primary text-primary bg-transparent hover:bg-primary-light',
    danger: 'bg-accent-rose text-white hover:bg-accent-rose/90 border border-transparent',
    ghost: 'bg-transparent text-primary hover:bg-primary-light border border-transparent',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base font-bold',
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
      )}
      {!loading && icon && <span className="mr-1.5 flex items-center justify-center">{icon}</span>}
      {children}
    </button>
  );
}
