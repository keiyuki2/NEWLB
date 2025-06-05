import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 transition-opacity duration-300 ease-in-out" onClick={onClose}>
      <div
        className={`bg-dark-surface p-6 rounded-xl shadow-2xl transform transition-all duration-300 ease-in-out opacity-0 animate-modal-enter w-full ${sizeClasses[size]}`}
        onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
      >
        {title && (
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-dark-border">
            <h3 className="text-xl font-semibold text-gray-100">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition-colors"
              aria-label="Close modal"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
};
