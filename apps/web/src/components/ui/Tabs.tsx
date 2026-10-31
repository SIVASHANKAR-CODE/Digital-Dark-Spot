import React from 'react';
import { clsx } from 'clsx';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={clsx('border-b border-slate-200 overflow-x-auto', className)}>
      <nav className="flex space-x-1 sm:space-x-4 min-w-max" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={clsx(
                'group inline-flex items-center gap-2 py-3 px-3 border-b-2 font-medium text-sm transition-all focus:outline-none',
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.icon && (
                <span
                  className={clsx(
                    'transition-colors',
                    isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-500'
                  )}
                >
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={clsx(
                    'text-xs px-2 py-0.5 rounded-full font-semibold',
                    isActive
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

