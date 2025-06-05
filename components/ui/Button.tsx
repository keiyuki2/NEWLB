import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'filter';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isActive?: boolean; // For filter buttons
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  isActive = false,
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-surface focus:ring-opacity-75 transition-all duration-150 ease-in-out inline-flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-brand-primary hover:bg-purple-600 text-white focus:ring-brand-primary',
    secondary: 'bg-brand-secondary hover:bg-pink-600 text-white focus:ring-brand-secondary',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    ghost: 'bg-transparent hover:bg-dark-border text-gray-200 focus:ring-gray-500',
    outline: 'bg-dark-surface border border-dark-border hover:border-gray-500 text-gray-200 focus:ring-brand-primary',
    filter: `border border-dark-border text-gray-300 hover:border-gray-500 ${isActive ? 'bg-button-active text-white border-button-active hover:border-button-active' : 'bg-dark-surface hover:bg-dark-border'}`,
  };

  const sizeStyles = {
    xs: 'px-2.5 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm', // Adjusted default text size to sm
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {leftIcon && !isLoading && <span className={`mr-1.5 ${size === 'xs' || size ==='sm' ? 'text-xs' : 'text-sm'}`}>{leftIcon}</span>}
      {children}
      {rightIcon && !isLoading && <span className={`ml-1.5 ${size === 'xs' || size ==='sm' ? 'text-xs' : 'text-sm'}`}>{rightIcon}</span>}
    </button>
  );
};