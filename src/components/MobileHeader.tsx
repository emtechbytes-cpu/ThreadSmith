import React from 'react';
import { MenuIcon } from './icons/MenuIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface MobileHeaderProps {
  onToggleSidebar: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header className="lg:hidden flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <SparklesIcon className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">ThreadSmith AI</span>
        </h1>
      </div>
      <button 
        onClick={onToggleSidebar}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-border"
        aria-label="Open sidebar"
      >
        <MenuIcon className="w-6 h-6 text-gray-600 dark:text-slate-300" />
      </button>
    </header>
  );
};

export default MobileHeader;
