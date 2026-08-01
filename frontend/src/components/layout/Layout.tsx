import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Menu, Activity } from 'lucide-react';
import Sidebar from './Sidebar';

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-indigo-500/30 overflow-hidden relative w-full max-w-[100vw]">
      <Sidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />
      
      <main className="flex-1 relative flex flex-col z-0 min-h-0 h-full w-full">
        {/* Mobile Top Bar */}
        <div className="md:hidden h-14 flex items-center justify-between px-4 border-b border-white/5 bg-[#09090b]/90 backdrop-blur-md z-10 shrink-0">
          <Link to="/" className="flex items-center space-x-2 cursor-pointer group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Activity size={14} className="text-white" />
            </div>
            <span className="font-bold text-zinc-100 tracking-wide text-sm">VSAL OS</span>
          </Link>
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Subtle Ambient Glow in the background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 mix-blend-screen blur-[120px] rounded-full pointer-events-none z-[-1]" />
        
        <div className="flex-1 p-2 md:p-6 lg:p-10 overflow-y-auto w-full">
          <Outlet />
        </div>
      </main>
      
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
