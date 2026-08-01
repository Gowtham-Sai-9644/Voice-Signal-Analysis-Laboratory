import { NavLink, Link } from 'react-router-dom';
import { 
  Activity, 
  BarChart2, 
  UploadCloud, 
  BookOpen, 
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const Sidebar = ({ mobileOpen = false, setMobileOpen = () => {} }: { mobileOpen?: boolean, setMobileOpen?: (open: boolean) => void }) => {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { path: '/live', label: 'Live Analyzer', icon: Activity },
    { path: '/spectrum', label: 'Spectrum Analyzer', icon: BarChart2 },
    { path: '/upload', label: 'Audio Upload', icon: UploadCloud },
    { path: '/lab', label: 'Session Reports', icon: BookOpen },
  ];

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-50 transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:z-20
        bg-[#09090b] md:bg-[#09090b]/80 md:backdrop-blur-xl border-r border-white/10 transition-transform duration-300
        w-64 h-full flex-col
        ${collapsed ? 'md:w-16' : 'md:w-64'} flex`}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-white/5 shrink-0">
        <div className={`flex items-center ${collapsed ? 'hidden md:hidden' : 'flex'}`}>
          <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center space-x-2 cursor-pointer group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
              <Activity size={16} className="text-white" />
            </div>
            <span className="font-bold text-zinc-100 tracking-wide text-sm group-hover:text-white transition-colors">VSAL OS</span>
          </Link>
        </div>
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={`hidden md:flex p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-colors ${collapsed ? 'mx-auto' : ''}`}
        >
          <Menu size={16} />
        </button>
        <button 
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-start overflow-y-auto py-6 px-3 space-y-1 w-full">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex flex-row items-center justify-start px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 w-full ${
                isActive 
                  ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/10' 
                  : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
              }`
            }
          >
            <item.icon size={18} className={`${collapsed ? "md:mx-auto" : "mr-3"} shrink-0`} strokeWidth={2} />
            <span className={`${collapsed ? 'hidden' : 'inline'}`}>{item.label}</span>
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
