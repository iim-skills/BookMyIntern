import React, { useEffect } from 'react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'md' | 'lg' | 'xl';
}

export default function Drawer({
  isOpen,
  onClose,
  title,
  children,
  footer,
  width = 'md',
}: DrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const widths = {
    md: 'max-w-md w-full sm:w-[480px]',
    lg: 'max-w-lg w-full sm:w-[560px]',
    xl: 'max-w-xl w-full sm:w-[640px]',
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      aria-labelledby="slide-over-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 overflow-hidden">
        {/* Backdrop overlay */}
        <div
          className="absolute inset-0 bg-text-primary/30 backdrop-blur-xs transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Panel wrapper */}
        <div className="pointer-events-none fixed inset-y-0 right-0 flex pl-10">
          <div
            className={`pointer-events-auto w-screen ${widths[width]} transform bg-white shadow-xl transition-all duration-300 ease-in-out animate-slideInRight flex flex-col h-full`}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-surface-mid flex items-center justify-between flex-shrink-0 select-none">
              <h3 className="font-display font-extrabold text-base md:text-lg text-text-primary" id="slide-over-title">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-1 text-text-muted hover:text-text-primary hover:bg-surface-light rounded-full transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar bg-white">
              {children}
            </div>

            {/* Sticky footer */}
            {footer && (
              <div className="px-6 py-4 border-t border-surface-mid bg-surface-light flex items-center justify-end gap-2.5 flex-shrink-0">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
