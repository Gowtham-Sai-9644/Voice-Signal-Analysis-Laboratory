import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, Zap, Hexagon, BarChart, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

const bgImages = [
  '/assets/bgs/bg_waveform_1785068995285.jpg',
  '/assets/bgs/bg_spectrum_1785069007605.jpg',
  '/assets/bgs/bg_microchip_1785069021704.jpg',
  '/assets/bgs/bg_theory_1785069034461.jpg',
  '/assets/bgs/bg_workstation_1785069047722.jpg',
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % bgImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans overflow-x-hidden flex flex-col relative selection:bg-indigo-500/30">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {bgImages.map((src, idx) => (
          <img 
            key={src}
            src={src} 
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[3000ms] ease-in-out ${idx === bgIndex ? 'opacity-20' : 'opacity-0'} mix-blend-screen`}
            alt="background"
          />
        ))}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-600/20 mix-blend-screen blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#09090b]/80 to-[#09090b]" />
      </div>

      {/* Header */}
      <header className="relative z-50 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/5 bg-[#09090b]/50 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center space-x-3 group cursor-pointer"
        >
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
            <Activity className="text-white" size={18} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-xl tracking-wide text-zinc-100 group-hover:text-white transition-colors">VSAL OS</span>
        </motion.div>

        <motion.nav 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hidden md:flex items-center space-x-8 font-medium text-sm text-zinc-400"
        >
          <a href="#features" className="hover:text-zinc-100 transition-colors">Features</a>
          <a href="#interface" className="hover:text-zinc-100 transition-colors">Interface</a>
          <a href="#" className="hover:text-zinc-100 transition-colors">Docs</a>
        </motion.nav>

        <motion.button 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onClick={() => navigate('/live')}
          className="flex items-center space-x-2 bg-white hover:bg-zinc-200 text-black px-5 py-2 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-white/10"
        >
          <span>Initialize</span>
          <ArrowRight size={16} />
        </motion.button>
      </header>

      <main className="relative z-10 w-full">
        
        {/* HERO SECTION */}
        <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-6 pt-20 pb-32">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-10 shadow-xl backdrop-blur-md"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-zinc-300 tracking-wide">Voice Analyzer Live</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 leading-[1.1] mb-8 tracking-tighter max-w-5xl mx-auto filter drop-shadow-sm"
          >
            Professional Voice Analysis, <br />
            <span className="bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient">Made Simple.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            A powerful workstation for recording, analyzing, and visualizing your voice in real-time. Built for engineers, designed for everyone.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 w-full max-w-md mx-auto"
          >
            <button 
              onClick={() => navigate('/live')}
              className="group w-full sm:w-auto flex items-center justify-center space-x-2 bg-white hover:bg-zinc-200 text-black px-8 py-4 rounded-xl font-bold text-base transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:scale-105"
            >
              <span>Launch Workstation</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce text-zinc-500"
          >
            <span className="text-xs uppercase tracking-widest font-bold mb-2">Scroll to explore</span>
            <ChevronDown size={20} />
          </motion.div>
        </section>

        {/* WORKSTATION MOCKUP ON SCROLL */}
        <section id="interface" className="py-32 px-6 w-full max-w-7xl mx-auto flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="w-full aspect-[16/9] rounded-2xl bg-[#0E0E12] border border-white/10 shadow-[0_0_100px_rgba(129,140,248,0.15)] overflow-hidden relative group cursor-pointer"
            onClick={() => navigate('/live')}
          >
            {/* Mockup Header */}
            <div className="h-12 w-full bg-white/5 border-b border-white/10 flex items-center px-4 space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            {/* Mockup Body - Simulated Spectrum */}
            <div className="w-full h-full relative overflow-hidden bg-[url('/assets/bgs/bg_spectrum_1785069007605.jpg')] bg-cover bg-center">
               <div className="absolute inset-0 bg-[#0E0E12]/80 backdrop-blur-sm"></div>
               <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/20 to-transparent mix-blend-screen"></div>
               
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/50 backdrop-blur-md border border-white/10 px-8 py-4 rounded-xl flex items-center space-x-3 group-hover:scale-110 transition-transform shadow-2xl">
                    <Activity className="text-indigo-400" size={24} />
                    <span className="text-white font-bold text-lg tracking-wide">Enter Live Analyzer</span>
                  </div>
               </div>
            </div>
          </motion.div>
        </section>

        {/* BENTO BOX GRID */}
        <section id="features" className="py-32 px-6 w-full max-w-7xl mx-auto">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Everything you need.</h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">Analyze voice signals with scientific accuracy wrapped in a beautiful interface.</p>
          </motion.div>

          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-2xl hover:border-indigo-500/50 transition-colors group"
            >
              <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                <Zap className="text-indigo-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Real-Time Audio</h3>
              <p className="text-zinc-400 font-medium leading-relaxed">
                Instant feedback with zero delay. Watch your voice come to life visually the moment you start speaking.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-2xl hover:border-purple-500/50 transition-colors group"
            >
              <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                <BarChart className="text-purple-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Frequency Spectrum</h3>
              <p className="text-zinc-400 font-medium leading-relaxed">
                See the exact frequencies, pitch, and energy of your voice with beautiful, high-resolution visualizers.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-2xl hover:border-emerald-500/50 transition-colors group"
            >
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                <Hexagon className="text-emerald-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Detailed Reports</h3>
              <p className="text-zinc-400 font-medium leading-relaxed">
                Automatically calculate the clarity and quality of your recordings with easy-to-read session metrics.
              </p>
            </motion.div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-32 px-6 w-full max-w-4xl mx-auto text-center border-t border-white/5 mt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-b from-white/10 to-transparent p-[1px] rounded-3xl"
          >
            <div className="bg-[#09090b] rounded-3xl p-12 md:p-20 relative overflow-hidden">
              <div className="absolute inset-0 bg-indigo-500/10 mix-blend-screen"></div>
              
              <h2 className="text-4xl font-black text-white mb-6 relative z-10">Ready to visualize?</h2>
              <p className="text-lg text-zinc-400 mb-10 relative z-10 max-w-xl mx-auto">
                Join thousands of engineers and vocalists analyzing their audio with state-of-the-art precision.
              </p>
              
              <button 
                onClick={() => navigate('/live')}
                className="relative z-10 bg-white hover:bg-zinc-200 text-black px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)] hover:scale-105"
              >
                Start Analyzing Free
              </button>
            </div>
          </motion.div>
        </section>

      </main>
    </div>
  );
};

export default LandingPage;
