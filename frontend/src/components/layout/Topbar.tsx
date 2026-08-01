import { Bell, User } from 'lucide-react';

const Topbar = () => {
  return (
    <header className="h-14 bg-white border-b border-laboratory-200 flex items-center justify-between px-4 dark:bg-laboratory-800 dark:border-laboratory-700">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold text-laboratory-800 dark:text-laboratory-50">
          Voice Signal Analysis Laboratory
        </h1>
        <span className="ml-4 px-2 py-0.5 rounded text-xs font-medium bg-engineering-primary/10 text-engineering-primary dark:bg-engineering-primary/20">
          v1.0.0
        </span>
      </div>
      
      <div className="flex items-center space-x-4 text-laboratory-500 dark:text-laboratory-400">
        <div className="flex items-center text-sm font-mono bg-laboratory-50 dark:bg-laboratory-900 px-3 py-1 rounded border border-laboratory-200 dark:border-laboratory-700">
          <span className="w-2 h-2 rounded-full bg-engineering-green mr-2 animate-pulse"></span>
          DSP Engine Ready
        </div>
        
        <button className="p-1.5 hover:bg-laboratory-100 dark:hover:bg-laboratory-700 rounded transition-colors">
          <Bell size={18} />
        </button>
        <button className="p-1.5 hover:bg-laboratory-100 dark:hover:bg-laboratory-700 rounded transition-colors">
          <User size={18} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
