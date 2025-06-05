import React from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  placeholder?: string;
  wrapperClassName?: string;
}

export const Select: React.FC<SelectProps> = ({ label, options, error, id, className = '', placeholder, wrapperClassName = '', ...props }) => {
  const baseSelectClasses = "w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none transition-colors duration-150 ease-in-out appearance-none text-sm text-gray-200 placeholder-gray-500";
  return (
    <div className={`w-full ${wrapperClassName}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-medium text-gray-400 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          className={`${baseSelectClasses} ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(option => (
            <option key={option.value} value={option.value} className="bg-dark-surface text-gray-200">
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
          <i className="fas fa-chevron-down text-xs"></i>
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};