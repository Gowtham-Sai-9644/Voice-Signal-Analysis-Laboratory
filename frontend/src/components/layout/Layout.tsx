import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="flex flex-col-reverse md:flex-row h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-indigo-500/30 overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 relative flex flex-col z-0 min-h-0">
        {/* Subtle Ambient Glow in the background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 mix-blend-screen blur-[120px] rounded-full pointer-events-none z-[-1]" />
        
        <div className="flex-1 p-4 md:p-6 lg:p-10 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
