
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '', text }) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-4',
    lg: 'h-16 w-16 border-[6px]',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} border-brand-primary border-t-transparent`}
        role="status"
        aria-live="polite"
        aria-label={text || "Loading..."}
      >
        <span className="sr-only">{text || "Loading..."}</span>
      </div>
      {text && <p className="mt-2 text-sm text-gray-300">{text}</p>}
    </div>
  );
};
    