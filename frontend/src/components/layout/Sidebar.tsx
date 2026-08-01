import { NavLink, Link } from 'react-router-dom';
import { 
  Activity, 
  BarChart2, 
  UploadCloud, 
  BookOpen, 
  Menu
} from 'lucide-react';
import { useState } from 'react';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { path: '/live', label: 'Live Analyzer', icon: Activity },
    { path: '/spectrum', label: 'Spectrum Analyzer', icon: BarChart2 },
    { path: '/upload', label: 'Audio Upload', icon: UploadCloud },
    { path: '/lab', label: 'Session Reports', icon: BookOpen },
  ];

  return (
    <aside 
      className={`relative z-20 bg-[#09090b]/80 backdrop-blur-xl border-r border-white/10 h-full flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
        {!collapsed && (
          <Link to="/" className="flex items-center space-x-2 cursor-pointer group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
              <Activity size={16} className="text-white" />
            </div>
            <span className="font-bold text-zinc-100 tracking-wide text-sm group-hover:text-white transition-colors">VSAL OS</span>
          </Link>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-colors ${collapsed ? 'mx-auto' : ''}`}
        >
          <Menu size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/10' 
                  : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
              }`
            }
          >
            <item.icon size={18} className={collapsed ? "mx-auto" : "mr-3"} strokeWidth={2} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </div>
      
      {!collapsed && (
        <div className="p-4 m-3 bg-gradient-to-b from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl">
          <p className="text-xs font-semibold text-indigo-300 mb-1">System Status</p>
          <div className="flex items-center text-[10px] text-zinc-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" /> DSP Online
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
