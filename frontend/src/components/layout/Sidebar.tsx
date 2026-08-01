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
      className={`relative z-20 bg-[#09090b]/80 backdrop-blur-xl border-white/10 transition-all duration-300
        w-full h-16 flex-row border-t border-r-0
        md:h-full md:flex-col md:border-r md:border-t-0 ${
        collapsed ? 'md:w-16' : 'md:w-64'
      } flex`}
    >
      <div className="hidden md:flex h-16 items-center justify-between px-4 border-b border-white/5">
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

      <div className="flex-1 flex md:flex-col items-center justify-around md:justify-start overflow-y-auto md:py-6 md:px-3 md:space-y-1 w-full md:w-auto h-full md:h-auto px-2">
        {/* Mobile Home Button */}
        <Link 
          to="/" 
          className="md:hidden flex flex-col items-center justify-center px-2 py-2 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-1">
            <Activity size={14} className="text-white" />
          </div>
          <span className="text-[10px] font-medium text-center">Home</span>
        </Link>

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col md:flex-row items-center justify-center md:justify-start px-2 md:px-3 py-2 md:py-2.5 text-[10px] md:text-sm font-medium rounded-lg transition-all duration-200 w-16 md:w-full ${
                isActive 
                  ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/10' 
                  : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
              }`
            }
          >
            <item.icon size={18} className={`${collapsed ? "md:mx-auto" : "md:mr-3"} mb-1 md:mb-0`} strokeWidth={2} />
            <span className={`text-center ${collapsed ? 'hidden' : 'hidden md:inline'}`}>{item.label}</span>
            <span className="md:hidden truncate w-full text-center">{item.label.split(' ')[0]}</span>
          </NavLink>
        ))}
      </div>
      
      {!collapsed && (
        <div className="hidden md:block p-4 m-3 bg-gradient-to-b from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl">
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
