import React from 'react';
import type { HistoryItem } from '../types';
import { XIcon } from './icons/XIcon';
import { TrashIcon } from './icons/TrashIcon';
import { formatTimeAgo } from '../utils';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onLoadHistory: (item: HistoryItem) => void;
  onDeleteHistory: (id: string) => void;
  onClearHistory: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({
  isOpen,
  onClose,
  history,
  onLoadHistory,
  onDeleteHistory,
  onClearHistory,
}) => {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-light-surface dark:bg-dark-surface z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Generation History</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-border"
            aria-label="Close history panel"
          >
            <XIcon className="w-6 h-6 text-gray-600 dark:text-slate-300" />
          </button>
        </header>

        <div className="h-[calc(100%-140px)] overflow-y-auto">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <p className="text-gray-500 dark:text-slate-400">Your generated threads will appear here.</p>
            </div>
          ) : (
            <ul className="divide-y divide-light-border dark:divide-dark-border">
              {history.map((item) => (
                <li key={item.id} className="group relative p-4 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                  <button onClick={() => onLoadHistory(item)} className="w-full text-left">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{item.formData.topic}</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{formatTimeAgo(item.timestamp)}</p>
                  </button>
                  <button
                    onClick={() => onDeleteHistory(item.id)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Delete history item"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <footer className="absolute bottom-0 left-0 right-0 p-4 border-t border-light-border dark:border-dark-border">
          <button
            onClick={onClearHistory}
            disabled={history.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-600 font-semibold rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TrashIcon className="w-5 h-5" />
            Clear All History
          </button>
        </footer>
      </aside>
    </>
  );
};

export default HistoryPanel;
