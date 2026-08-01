import { useEffect, useRef, useState } from 'react';
import { engine } from '../audio/AudioEngine';
import type { SessionLog } from '../audio/AudioEngine';
import { BookOpen, Activity, Zap, Cpu, ListFilter, PlayCircle, FileText, X, Volume2, Maximize2 } from 'lucide-react';



const InfoTheoryLab = () => {
  const [isRunning, setIsRunning] = useState(engine.isRunning);
  const [history, setHistory] = useState<SessionLog[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionLog | null>(null);
  
  const requestRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const checkState = () => {
      if (engine.isRunning !== isRunning) {
        setIsRunning(engine.isRunning);
      }
      
      if (engine.sessionHistory.length > 0) {
        const latestId = engine.sessionHistory[0].id;
        const currentLatestId = history.length > 0 ? history[0].id : null;
        if (latestId !== currentLatestId) {
          setHistory([...engine.sessionHistory]);
        }
      }

      requestRef.current = requestAnimationFrame(checkState);
    };

    requestRef.current = requestAnimationFrame(checkState);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning, history]);

  const formatHz = (val: number) => val > 1000 ? (val/1000).toFixed(2) + " kHz" : Math.round(val) + " Hz";

  const latestSession = history.length > 0 ? history[0] : null;

  return (
    <div className="space-y-8 font-sans pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/5 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-white/10 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center">
            <BookOpen className="mr-3 text-indigo-400" /> Session Reports
          </h2>
          <p className="text-sm text-zinc-400 mt-1 font-medium">
            Review detailed reports and theoretical limits from your recorded sessions. 
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {isRunning ? (
            <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center animate-pulse">
              <PlayCircle size={18} className="mr-2" />
              Recording Active...
            </div>
          ) : (
             <div className="bg-white/5 text-zinc-400 border border-white/10 px-4 py-2 rounded-lg text-sm font-bold shadow-sm">
              Engine Standby
            </div>
          )}
        </div>
      </div>

      {/* QUICK SUMMARY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex flex-col justify-between shadow-xl group hover:border-indigo-500/50 transition-all">
          <div>
            <div className="flex items-center text-zinc-400 mb-2">
              <Activity size={18} className="mr-2 text-indigo-400 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold uppercase tracking-wider text-xs">Avg Spectral Entropy (H)</h3>
            </div>
            <div className="text-4xl font-black font-mono text-white my-4">
              {latestSession ? latestSession.entropy.toFixed(3) : "---"} <span className="text-sm font-sans font-medium text-zinc-500">bits</span>
            </div>
          </div>
          <div className="bg-black/40 p-4 rounded-xl mt-4 border border-white/5">
            <p className="text-xs text-indigo-300 font-mono mb-2 border-b border-white/10 pb-2">
              H = - Σ (P(f) * log₂(P(f)))
            </p>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Average randomness/complexity of the signal during the session. White noise has maximum entropy (1.0).
            </p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex flex-col justify-between shadow-xl group hover:border-purple-500/50 transition-all">
          <div>
            <div className="flex items-center text-zinc-400 mb-2">
              <Zap size={18} className="mr-2 text-purple-400 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold uppercase tracking-wider text-xs">Avg Signal-to-Noise (SNR)</h3>
            </div>
            <div className="text-4xl font-black font-mono text-white my-4">
               {latestSession ? latestSession.snrDb.toFixed(1) : "---"} <span className="text-sm font-sans font-medium text-zinc-500">dB</span>
            </div>
          </div>
          <div className="bg-black/40 p-4 rounded-xl mt-4 border border-white/5">
             <p className="text-xs text-purple-300 font-mono mb-2 border-b border-white/10 pb-2">
              SNR(dB) = 10 * log₁₀(P_signal / P_noise)
            </p>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Average signal clarity over the noise floor. Higher SNR means the vocal/signal was clearer.
            </p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex flex-col justify-between shadow-xl group hover:border-emerald-500/50 transition-all">
          <div>
            <div className="flex items-center text-zinc-400 mb-2">
              <Cpu size={18} className="mr-2 text-emerald-400 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold uppercase tracking-wider text-xs">Avg Shannon Capacity (C)</h3>
            </div>
            <div className="text-4xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 my-4">
              {latestSession ? (latestSession.capacity / 1000).toFixed(1) : "---"} <span className="text-sm font-sans font-medium text-zinc-500">kbps</span>
            </div>
          </div>
          <div className="bg-black/40 p-4 rounded-xl mt-4 border border-white/5">
             <p className="text-xs text-emerald-300 font-mono mb-2 border-b border-white/10 pb-2">
              C = B * log₂(1 + S/N)
            </p>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Theoretical maximum rate at which information could be transmitted over the audio channel during this session.
            </p>
          </div>
        </div>
      </div>
      
      {/* HISTORY TABLE */}
      <div className="flex-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col min-h-0 shadow-xl relative z-0 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
          <h3 className="text-lg font-bold text-white flex items-center">
            <ListFilter size={20} className="mr-2 text-indigo-400" />
            Session History Log
          </h3>
          <span className="text-xs font-bold text-zinc-400 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
            Sessions Completed: {history.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/20 text-zinc-400 uppercase text-[10px] font-bold tracking-wider font-mono border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Peak Freq</th>
                <th className="px-6 py-4 text-indigo-400">Entropy</th>
                <th className="px-6 py-4 text-purple-400">SNR</th>
                <th className="px-6 py-4 text-emerald-400">Capacity</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-zinc-300">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-zinc-500 font-sans">
                    <div className="bg-black/40 border border-white/5 rounded-xl p-8 max-w-md mx-auto">
                      <p className="font-bold text-white mb-2">No sessions recorded yet.</p>
                      <p className="text-sm text-zinc-400">1. Go to the Live Analyzer.</p>
                      <p className="text-sm text-zinc-400">2. Click Start Analysis and speak.</p>
                      <p className="text-sm text-zinc-400">3. Click Stop Analysis to finalize the session.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                history.map((snapshot) => (
                  <tr key={snapshot.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-white font-semibold">{snapshot.timestamp}</td>
                    <td className="px-6 py-4 text-zinc-400">{(snapshot.durationMs / 1000).toFixed(1)}s</td>
                    <td className="px-6 py-4 font-bold">{formatHz(snapshot.dominantFreq)}</td>
                    <td className="px-6 py-4 text-indigo-400 font-bold">{snapshot.entropy.toFixed(3)}</td>
                    <td className="px-6 py-4 text-purple-400 font-bold">{snapshot.snrDb.toFixed(1)} dB</td>
                    <td className="px-6 py-4 text-emerald-400 font-bold">{(snapshot.capacity / 1000).toFixed(1)} kbps</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedSession(snapshot)}
                        className="bg-indigo-500/10 hover:bg-indigo-500 border border-indigo-500/20 hover:text-white text-indigo-400 px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-end w-full shadow-sm"
                      >
                        <FileText size={14} className="mr-1.5" /> View Report
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REPORT MODAL */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-sm">
          <div className="bg-[#09090b] border border-white/10 rounded-2xl shadow-2xl shadow-indigo-500/10 w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-8 py-5 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center">
                  <FileText className="mr-3 text-indigo-400" /> Session Analysis Report
                </h2>
                <div className="text-xs text-zinc-400 mt-2 font-mono flex items-center space-x-6">
                  <span className="bg-black/50 px-2 py-1 rounded">ID: {selectedSession.id}</span>
                  <span>TIME: {selectedSession.timestamp}</span>
                  <span>DUR: {(selectedSession.durationMs / 1000).toFixed(2)}s</span>
                  <span>SAMPLES: {selectedSession.totalSamples}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSession(null)}
                className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto flex-1 space-y-8">
              
              {/* Spectrum Graph Section - Updated to visual aesthetic */}
              <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
                {/* Background Image */}
                <div className="absolute inset-0 bg-[url('/assets/bgs/bg_spectrum_1785069007605.jpg')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"></div>
                <div className="absolute inset-0 bg-[#09090b]/60 backdrop-blur-[2px]"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 mix-blend-overlay"></div>
                
                {/* Content */}
                <div className="relative z-10 p-8 md:p-12 flex flex-col items-start justify-center min-h-[250px]">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-300 mb-2 flex items-center">
                    <Activity size={16} className="mr-2" /> Peak Acoustic Telemetry
                  </h3>
                  
                  <div className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-400 font-mono tracking-tighter mb-4 drop-shadow-lg">
                    {formatHz(selectedSession.dominantFreq)}
                  </div>
                  
                  <p className="text-zinc-300 font-medium max-w-lg leading-relaxed">
                    Maximum frequency peak detected over a {(selectedSession.durationMs/1000).toFixed(1)}s session window, analyzed from {selectedSession.totalSamples} spectrum snapshots.
                  </p>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Spectral Details */}
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mb-5 flex items-center">
                    <Maximize2 size={18} className="mr-2 text-purple-400" /> Acoustic Measurements
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <span className="text-sm text-zinc-400 font-medium">Average Noise Floor</span>
                      <span className="font-mono font-bold text-white">{selectedSession.avgNoiseFloorDb.toFixed(1)} dB</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <span className="text-sm text-zinc-400 font-medium">Average Signal Peak</span>
                      <span className="font-mono font-bold text-purple-400">{selectedSession.avgPeakSignalDb.toFixed(1)} dB</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <span className="text-sm text-zinc-400 font-medium">Average True Signal Level</span>
                      <span className="font-mono font-bold text-white">{selectedSession.avgSignalDb.toFixed(1)} dB</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <span className="text-sm text-zinc-400 font-medium">Absolute Max Peak Freq</span>
                      <span className="font-mono font-bold text-indigo-400">{formatHz(selectedSession.dominantFreq)}</span>
                    </div>
                  </div>
                </div>

                {/* Energy Band Breakdown */}
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-sm flex flex-col">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mb-5 flex items-center">
                    <Volume2 size={18} className="mr-2 text-emerald-400" /> Vocal Energy Distribution
                  </h3>
                  
                  <div className="flex-1 flex flex-col justify-center space-y-6">
                    {/* Bass */}
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="text-emerald-400 tracking-wide">Bass (0 - 250 Hz)</span>
                        <span className="font-mono text-zinc-300">{selectedSession.energyBass.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-black/50 border border-white/5 rounded-full h-2">
                        <div className="bg-emerald-400 h-2 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]" style={{width: `${selectedSession.energyBass}%`}}></div>
                      </div>
                    </div>
                    
                    {/* Mids */}
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="text-indigo-400 tracking-wide">Mids (250 - 4k Hz)</span>
                        <span className="font-mono text-zinc-300">{selectedSession.energyMid.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-black/50 border border-white/5 rounded-full h-2">
                        <div className="bg-indigo-400 h-2 rounded-full shadow-[0_0_10px_rgba(129,140,248,0.5)]" style={{width: `${selectedSession.energyMid}%`}}></div>
                      </div>
                    </div>

                    {/* Treble */}
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="text-pink-400 tracking-wide">Treble (4k+ Hz)</span>
                        <span className="font-mono text-zinc-300">{selectedSession.energyTreble.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-black/50 border border-white/5 rounded-full h-2">
                        <div className="bg-pink-400 h-2 rounded-full shadow-[0_0_10px_rgba(244,114,182,0.5)]" style={{width: `${selectedSession.energyTreble}%`}}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoTheoryLab;
