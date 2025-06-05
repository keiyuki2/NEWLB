
import React, { ReactNode } from 'react';

interface TabItem {
  label: string;
  content: ReactNode;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: number;
  onTabChange: (index: number) => void;
  variant?: 'line' | 'pills';
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange, variant = 'line' }) => {
  return (
    <div>
      <div className={`flex ${variant === 'line' ? 'border-b border-dark-border' : 'bg-dark-surface p-1 rounded-lg'} space-x-1 mb-4`}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => onTabChange(index)}
            className={`flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors duration-150
              ${activeTab === index
                ? (variant === 'line' ? 'border-b-2 border-brand-primary text-brand-primary' : 'bg-brand-primary text-white')
                : (variant === 'line' ? 'border-b-2 border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500' : 'text-gray-300 hover:bg-gray-700 hover:text-gray-100')
              }
            `}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
};
    