import React, { ReactNode } from 'react';
import { useAppContext } from '../../contexts/AppContext';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  titleIcon?: React.ReactNode;
  actions?: ReactNode; // e.g., buttons in the header
  noPadding?: boolean; // Option to remove padding from content area
  headerClassName?: string;
  contentClassName?: string;
}

export const Card: React.FC<CardProps> = ({ 
    children, 
    className = '', 
    title, 
    titleIcon, 
    actions, 
    noPadding = false,
    headerClassName = '',
    contentClassName = '' 
}) => {
  const { siteSettings } = useAppContext();
  // Use a default border radius if not set, matching screenshot style.
  const borderRadius = siteSettings.cardBorderRadius || 'rounded-lg'; 

  return (
    <div className={`bg-dark-surface border border-dark-border shadow-md ${borderRadius} ${className} flex flex-col`}>
      {(title || actions) && (
        <div className={`px-4 py-3 sm:px-5 border-b border-dark-border flex justify-between items-center ${borderRadius.startsWith('rounded-t') ? borderRadius : `rounded-t-lg`} ${headerClassName}`}>
          {title && (
            <h3 className="text-md lg:text-lg font-semibold text-gray-200 flex items-center">
              {titleIcon && <span className="mr-2 opacity-80">{titleIcon}</span>}
              {title}
            </h3>
          )}
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
      )}
      <div className={`${noPadding ? '' : 'p-4 sm:p-5'} flex-grow ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
};