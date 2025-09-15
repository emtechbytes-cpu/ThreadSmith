// FIX: Replaced malformed file content with a valid React component and corrected import paths.
import React from 'react';
import { HistoryIcon } from './components/icons/HistoryIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { ThemeToggleButton } from './components/ThemeToggleButton';

interface SidebarProps {
  onShowHistory: () => void;
  children: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ onShowHistory, children }) => {
  return (
    <aside className="w-full lg:w-[480px] xl:w-[520px] bg-light-surface/80 dark:bg-dark-surface/80 backdrop-blur-xl border-r border-light-border dark:border-dark-border h-screen overflow-y-auto flex-shrink-0">
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-light-surface/60 dark:bg-dark-surface/60 backdrop-blur-lg border-b border-light-border dark:border-dark-border/50">
        <div className="flex items-center gap-3">
            <SparklesIcon className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">ThreadSmith AI</span>
            </h1>
        </div>
        <div className="flex items-center gap-2">
            <ThemeToggleButton />
            <button
            onClick={onShowHistory}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-dark-border/50 dark:text-slate-200 dark:hover:bg-dark-border transition-colors duration-200"
            aria-label="View generation history"
            >
            <HistoryIcon className="w-5 h-5" />
            <span className="hidden sm:inline">History</span>
            </button>
        </div>
      </header>
      <div className="p-6">
        {children}
      </div>
    </aside>
  );
};

export default Sidebar;
