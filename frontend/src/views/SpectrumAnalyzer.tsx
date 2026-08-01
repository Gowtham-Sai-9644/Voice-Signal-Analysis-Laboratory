import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { engine } from '../audio/AudioEngine';
import { Play, Pause, MousePointer2, Activity, Square, Mic } from 'lucide-react';

const SpectrumAnalyzer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | undefined>(undefined);
  
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [peakHold, setPeakHold] = useState(true);
  const [channelMode, setChannelMode] = useState('Mono');
  
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  
  const peakDataRef = useRef<Float32Array | null>(null);
  const [hoverData, setHoverData] = useState<{freq: number, db: number, x: number, y: number} | null>(null);

  useEffect(() => {
    const initDevices = async () => {
      try {
        const d = await engine.getDevices();
        setDevices(d);
        if (d.length > 0) setSelectedDevice(d[0].deviceId);
      } catch (e) {
        console.error("Could not enumerate devices", e);
      }
    };
    initDevices();

    if (engine.isRunning) {
      setIsRunning(true);
      draw();
    }
    
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const toggleEngine = async () => {
    if (isRunning) {
      engine.stop();
      setIsRunning(false);
      setIsPaused(false);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    } else {
      try {
        await engine.startMicrophone(selectedDevice);
        setIsRunning(true);
        setIsPaused(false);
        peakDataRef.current = null; 
        draw();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const drawScientificGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; 
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    for (let i = 0; i <= 10; i++) {
      const y = (i / 10) * height;
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    
    [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000].forEach(freq => {
      const minLog = Math.log10(20);
      const maxLog = Math.log10(20000);
      const x = ((Math.log10(freq) - minLog) / (maxLog - minLog)) * width;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    });
    
    ctx.stroke();
  };

  const draw = () => {
    if (isPaused) {
      requestRef.current = requestAnimationFrame(draw);
      return;
    }

    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const width = canvas.width;
        const height = canvas.height;
        const data = engine.getFrequencyData();
        
        if (!peakDataRef.current || peakDataRef.current.length !== data.length) {
          peakDataRef.current = new Float32Array(data.length).fill(-Infinity);
        }

        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'; 
        ctx.fillRect(0, 0, width, height);
        
        drawScientificGrid(ctx, width, height);
        
        const nyquist = 44100 / 2;
        const minFreq = 20;
        const maxFreq = 20000;
        const minLog = Math.log10(minFreq);
        const maxLog = Math.log10(maxFreq);
        
        if (peakHold && peakDataRef.current) {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(129, 140, 248, 0.6)'; // indigo-400
          ctx.lineWidth = 1;
          
          let started = false;
          for (let i = 0; i < data.length; i++) {
            const freq = (i / data.length) * nyquist;
            if (freq < minFreq) continue;
            if (freq > maxFreq) break;
            
            if (data[i] > peakDataRef.current[i]) {
              peakDataRef.current[i] = data[i];
            }
            
            const logFreq = Math.log10(freq);
            const x = ((logFreq - minLog) / (maxLog - minLog)) * width;
            const db = Math.max(peakDataRef.current[i], -100);
            const y = height - ((db + 100) / 100) * height;
            
            if (!started) {
              ctx.moveTo(x, y);
              started = true;
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
        }
        
        ctx.beginPath();
        ctx.strokeStyle = '#c084fc'; // purple-400
        ctx.fillStyle = 'rgba(192, 132, 252, 0.15)';
        ctx.lineWidth = 1.5;
        
        ctx.moveTo(0, height);
        
        for (let i = 0; i < data.length; i++) {
          const freq = (i / data.length) * nyquist;
          if (freq < minFreq) continue;
          if (freq > maxFreq) break;
          
          const logFreq = Math.log10(freq);
          const x = ((logFreq - minLog) / (maxLog - minLog)) * width;
          
          const db = Math.max(data[i], -100);
          const y = height - ((db + 100) / 100) * height;
          
          ctx.lineTo(x, y);
        }
        
        ctx.lineTo(width, height);
        ctx.stroke();
        ctx.fill();
        
        if (hoverData) {
          ctx.strokeStyle = 'rgba(255,255,255,0.4)';
          ctx.setLineDash([4, 4]);
          
          ctx.beginPath();
          ctx.moveTo(hoverData.x, 0);
          ctx.lineTo(hoverData.x, height);
          ctx.stroke();
          
          ctx.beginPath();
          ctx.moveTo(0, hoverData.y);
          ctx.lineTo(width, hoverData.y);
          ctx.stroke();
          
          ctx.setLineDash([]);
          
          ctx.fillStyle = '#FFF';
          ctx.beginPath();
          ctx.arc(hoverData.x, hoverData.y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    requestRef.current = requestAnimationFrame(draw);
  };

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;
    
    const minFreq = 20;
    const maxFreq = 20000;
    const minLog = Math.log10(minFreq);
    const maxLog = Math.log10(maxFreq);
    
    const logFreq = (x / width) * (maxLog - minLog) + minLog;
    const freq = Math.pow(10, logFreq);
    
    const db = ((height - y) / height) * 100 - 100;
    
    setHoverData({ freq, db, x, y });
  };

  const handleMouseLeave = () => {
    setHoverData(null);
  };

  const formatHz = (val: number) => val > 1000 ? (val/1000).toFixed(2) + " kHz" : Math.round(val) + " Hz";

  return (
    <div className="space-y-6 h-full flex flex-col font-sans">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white/5 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/10 space-y-4 lg:space-y-0">
        
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center">
            <Activity className="mr-3 text-purple-400" size={20} />
            Spectrum Analyzer
          </h2>
          
          <div className="hidden sm:block h-6 w-px bg-white/10 mx-2"></div>
          
          <select 
            className="border border-white/10 rounded-lg px-3 py-1.5 text-sm bg-black/50 text-zinc-300 outline-none focus:ring-1 focus:ring-purple-500/50 w-full sm:w-auto"
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            disabled={isRunning}
          >
            {devices.map(d => (
              <option key={d.deviceId} value={d.deviceId}>{d.label || `Microphone ${d.deviceId.slice(0,5)}`}</option>
            ))}
          </select>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 lg:space-x-4 w-full lg:w-auto">
          <div className="bg-black/50 p-1 rounded-lg flex space-x-1 border border-white/5 flex-wrap">
            {['Mono', 'Stereo', 'Mid', 'Side'].map(mode => (
              <button 
                key={mode}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors flex-1 text-center sm:flex-none ${channelMode === mode ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                onClick={() => setChannelMode(mode)}
              >
                {mode}
              </button>
            ))}
          </div>

          <label className="flex items-center space-x-2 text-sm mr-2 cursor-pointer text-zinc-300 font-medium">
            <input type="checkbox" checked={peakHold} onChange={(e) => setPeakHold(e.target.checked)} className="accent-purple-500" />
            <span>Peak Hold</span>
          </label>

          <div className="hidden sm:block h-6 w-px bg-white/10 mx-2"></div>

          <button onClick={() => setIsPaused(!isPaused)} className="flex-1 sm:flex-none justify-center bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors flex items-center" disabled={!isRunning}>
            {isPaused ? <Play size={16} className="mr-2" /> : <Pause size={16} className="mr-2" />}
            {isPaused ? 'Resume' : 'Freeze'}
          </button>

          <button onClick={toggleEngine} className={`flex-1 sm:flex-none justify-center ${isRunning ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 shadow-sm" : "bg-white text-black hover:bg-zinc-200 shadow-lg shadow-white/10"} px-5 py-2 rounded-lg text-sm font-bold transition-colors flex items-center`}>
            {isRunning ? <Square size={16} className="mr-2" /> : <Mic size={16} className="mr-2" />}
            {isRunning ? 'Stop Analysis' : 'Start Engine'}
          </button>
        </div>
      </div>
      
      <div className="flex-1 bg-white/5 backdrop-blur-md rounded-2xl flex flex-col min-h-0 relative border border-white/10 shadow-xl overflow-hidden">
        {/* Floating Tooltip */}
        <div className="absolute top-6 left-6 bg-black/80 backdrop-blur-md text-white font-mono text-xs p-4 rounded-xl shadow-2xl border border-white/10 z-10 min-w-[220px]">
          <div className="flex items-center mb-3 border-b border-white/10 pb-2 text-zinc-400 font-sans font-bold">
            <MousePointer2 size={14} className="mr-2" /> Cursor Inspector
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-zinc-500">Frequency:</span>
            <span className="font-bold text-indigo-400">{hoverData ? formatHz(hoverData.freq) : '---'}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-zinc-500">Amplitude:</span>
            <span className="font-bold text-purple-400">{hoverData ? hoverData.db.toFixed(1) + ' dB' : '---'}</span>
          </div>
        </div>

        {/* Labels Overlay */}
        <div className="absolute bottom-2 left-0 w-full flex justify-between px-3 text-xs font-mono font-semibold text-zinc-500 pointer-events-none">
          <span className="bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-md">20 Hz</span>
          <span className="bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-md">100 Hz</span>
          <span className="bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-md">1 kHz</span>
          <span className="bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-md">10 kHz</span>
          <span className="bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-md">20 kHz</span>
        </div>
        <div className="absolute top-0 left-0 h-full flex flex-col justify-between py-4 px-2 text-xs font-mono font-semibold text-zinc-500 pointer-events-none">
          <span className="bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-md">0 dB</span>
          <span className="bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-md">-50 dB</span>
          <span className="bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-md">-100 dB</span>
        </div>

        <div className="flex-1 w-full bg-black/40 relative overflow-hidden mix-blend-screen m-2 rounded-xl border border-white/5">
          <canvas 
            ref={canvasRef} 
            width={1600} 
            height={600} 
            className="w-full h-full object-fill cursor-crosshair absolute inset-0"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />
        </div>
      </div>
    </div>
  );
};

export default SpectrumAnalyzer;
