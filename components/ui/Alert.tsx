
import React, { ReactNode } from 'react';

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: ReactNode;
  className?: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type = 'info', title, children, className = '', onClose }) => {
  const baseClasses = 'p-4 rounded-lg border';
  const typeClasses = {
    info: 'bg-sky-900 border-sky-700 text-sky-100',
    success: 'bg-green-900 border-green-700 text-green-100',
    warning: 'bg-yellow-900 border-yellow-700 text-yellow-100',
    error: 'bg-red-900 border-red-700 text-red-100',
  };

  const iconClasses = {
    info: 'fas fa-info-circle',
    success: 'fas fa-check-circle',
    warning: 'fas fa-exclamation-triangle',
    error: 'fas fa-times-circle',
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]} ${className} flex items-start`} role="alert">
      <div className="flex-shrink-0 mr-3">
        <i className={`${iconClasses[type]} text-xl`}></i>
      </div>
      <div className="flex-grow">
        {title && <h5 className="font-semibold mb-1">{title}</h5>}
        <div className="text-sm">{children}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-md hover:bg-opacity-20 hover:bg-current focus:outline-none">
          <i className="fas fa-times"></i>
        </button>
      )}
    </div>
  );
};
    