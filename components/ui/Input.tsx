import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  wrapperClassName?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, id, className = '', wrapperClassName = '', ...props }) => {
  const baseInputClasses = "w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none transition-colors duration-150 ease-in-out placeholder-gray-500 text-sm text-gray-200";
  return (
    <div className={`w-full ${wrapperClassName}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-medium text-gray-400 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{icon}</span>
          </div>
        )}
        <input
          id={id}
          className={`${baseInputClasses} ${icon ? 'pl-10' : ''} ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, error, id, className = '', wrapperClassName = '', ...props }) => {
    const baseInputClasses = "w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none transition-colors duration-150 ease-in-out placeholder-gray-500 text-sm text-gray-200";
    return (
        <div className={`w-full ${wrapperClassName}`}>
        {label && (
            <label htmlFor={id} className="block text-xs font-medium text-gray-400 mb-1">
            {label}
            </label>
        )}
        <textarea
            id={id}
            className={`${baseInputClasses} ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
            rows={4}
            {...props}
        />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        </div>
    );
};