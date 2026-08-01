import { useEffect, useRef, useState } from 'react';
import { engine } from '../audio/AudioEngine';
import type { AudioMetrics } from '../audio/AudioEngine';
import { Square, Mic, Settings2, Activity } from 'lucide-react';

const LiveAnalyzer = () => {
  const waveformRef = useRef<HTMLCanvasElement>(null);
  const spectrumRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const [isRunning, setIsRunning] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  
  const [metrics, setMetrics] = useState<AudioMetrics | null>(null);
  const lastMetricsUpdate = useRef<number>(0);

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
    
    return () => stopAnalysis();
  }, []);

  const startAnalysis = async () => {
    try {
      await engine.startMicrophone(selectedDevice);
      setIsRunning(true);
      draw(performance.now());
    } catch (err) {
      console.error(err);
      alert("Failed to start microphone. Please check permissions.");
    }
  };

  const stopAnalysis = () => {
    engine.stop();
    setIsRunning(false);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  const drawScientificGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, isLogX: boolean = false) => {
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    for (let i = 0; i <= 10; i++) {
      const y = (i / 10) * height;
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    
    if (isLogX) {
      [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000].forEach(freq => {
        const minLog = Math.log10(20);
        const maxLog = Math.log10(20000);
        const x = ((Math.log10(freq) - minLog) / (maxLog - minLog)) * width;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      });
    } else {
      for (let i = 0; i <= 10; i++) {
        const x = (i / 10) * width;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
    }
    ctx.stroke();
    
    if (!isLogX) {
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
    }
  };

  const draw = (timestamp: number) => {
    if (timestamp - lastMetricsUpdate.current > 100) {
      setMetrics(engine.getMetrics());
      lastMetricsUpdate.current = timestamp;
    }

    if (waveformRef.current) {
      const canvas = waveformRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const width = canvas.width;
        const height = canvas.height;
        const data = engine.getTimeDomainData();
        
        ctx.clearRect(0, 0, width, height);
        drawScientificGrid(ctx, width, height, false);
        
        ctx.beginPath();
        ctx.strokeStyle = '#818cf8'; // indigo-400
        ctx.lineWidth = 1.5;
        
        const sliceWidth = width / data.length;
        let x = 0;
        
        for (let i = 0; i < data.length; i++) {
          const v = data[i]; 
          const y = (v * -0.5 + 0.5) * height; 
          
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          
          x += sliceWidth;
        }
        ctx.stroke();
      }
    }

    if (spectrumRef.current) {
      const canvas = spectrumRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const width = canvas.width;
        const height = canvas.height;
        const data = engine.getFrequencyData(); 
        
        ctx.clearRect(0, 0, width, height);
        drawScientificGrid(ctx, width, height, true);
        
        ctx.beginPath();
        ctx.strokeStyle = '#c084fc'; // purple-400
        ctx.fillStyle = 'rgba(192, 132, 252, 0.15)';
        ctx.lineWidth = 1.5;
        
        const nyquist = 44100 / 2; 
        const minFreq = 20;
        const maxFreq = 20000;
        const minLog = Math.log10(minFreq);
        const maxLog = Math.log10(maxFreq);
        
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
      }
    }

    requestRef.current = requestAnimationFrame(draw);
  };

  const formatDB = (val: number) => val.toFixed(1) + " dB";
  const formatHz = (val: number) => val > 1000 ? (val/1000).toFixed(2) + " kHz" : Math.round(val) + " Hz";

  return (
    <div className="space-y-6 h-full flex flex-col font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/5 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/10 space-y-4 md:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
          <h2 className="text-xl font-semibold tracking-tight text-white flex items-center">
            <Activity className="mr-2 text-indigo-400" size={20} /> Live Analyzer
          </h2>
          
          <div className="hidden sm:block h-6 w-px bg-white/10 mx-2"></div>
          
          <select 
            className="border border-white/10 rounded-lg px-3 py-1.5 text-sm bg-black/50 text-zinc-300 outline-none focus:ring-1 focus:ring-indigo-500/50"
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            disabled={isRunning}
          >
            {devices.map(d => (
              <option key={d.deviceId} value={d.deviceId}>{d.label || `Microphone ${d.deviceId.slice(0,5)}`}</option>
            ))}
          </select>
        </div>
        
        <div className="flex space-x-3">
          {!isRunning ? (
            <button onClick={startAnalysis} className="bg-white text-black hover:bg-zinc-200 px-5 py-2 rounded-lg text-sm font-bold transition-colors flex items-center shadow-lg shadow-white/10">
              <Mic size={16} className="mr-2" /> Start Analysis
            </button>
          ) : (
            <button onClick={stopAnalysis} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-5 py-2 rounded-lg text-sm font-bold transition-colors flex items-center shadow-sm">
              <Square size={16} className="mr-2" /> Stop Analysis
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        <div className="lg:col-span-3 space-y-6 flex flex-col min-h-0">
          
          {/* Time Domain Panel */}
          <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex-1 flex flex-col min-h-[250px] md:min-h-0 relative group shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                Time Domain (Waveform)
              </h3>
              <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">Y: Amplitude | X: Time (ms)</span>
            </div>
            <div className="flex-1 w-full bg-black/40 rounded-xl border border-white/5 relative overflow-hidden shadow-inner">
              <canvas 
                ref={waveformRef} 
                width={1200} 
                height={300} 
                className="w-full h-full object-fill absolute inset-0 mix-blend-screen"
              />
              <div className="absolute bottom-2 left-0 w-full flex justify-between px-3 text-[10px] sm:text-xs font-mono font-semibold text-zinc-500 pointer-events-none">
                <span className="bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-md">0 ms</span>
                <span className="bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-md">Time &rarr;</span>
              </div>
              <div className="absolute top-0 left-0 h-full flex flex-col justify-between py-3 px-2 text-[10px] sm:text-xs font-mono font-semibold text-zinc-500 pointer-events-none">
                <span className="bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-md">+1.0</span>
                <span className="bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-md">0.0</span>
                <span className="bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-md">-1.0</span>
              </div>
            </div>
          </div>
          
          {/* Frequency Domain Panel */}
          <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex-1 flex flex-col min-h-[250px] md:min-h-0 relative group shadow-xl">
             <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                Frequency Domain (FFT Spectrum)
              </h3>
              <span className="text-[10px] font-mono text-zinc-500">Y: Magnitude (dB) | X: Frequency (Log Hz)</span>
            </div>
            <div className="flex-1 w-full bg-black/40 rounded-xl border border-white/5 relative overflow-hidden shadow-inner">
              <canvas 
                ref={spectrumRef} 
                width={1200} 
                height={300} 
                className="w-full h-full object-fill absolute inset-0 mix-blend-screen"
              />
              <div className="absolute bottom-2 left-0 w-full flex justify-between px-3 text-[10px] sm:text-xs font-mono font-semibold text-zinc-500 pointer-events-none">
                <span className="bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-md">20 Hz</span>
                <span className="bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-md hidden sm:inline">100 Hz</span>
                <span className="bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-md">1 kHz</span>
                <span className="bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-md hidden sm:inline">10 kHz</span>
                <span className="bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-md">20 kHz</span>
              </div>
              <div className="absolute top-0 left-0 h-full flex flex-col justify-between py-3 px-2 text-[10px] sm:text-xs font-mono font-semibold text-zinc-500 pointer-events-none">
                <span className="bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-md">0 dB</span>
                <span className="bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-md">-50 dB</span>
                <span className="bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-md">-100 dB</span>
              </div>
            </div>
          </div>

        </div>
        
        {/* Measurements Panel */}
        <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 flex flex-col min-h-0 overflow-y-auto shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
             <h3 className="text-sm font-bold tracking-wide text-zinc-100 flex items-center">
              <Settings2 size={16} className="mr-2 text-indigo-400" /> Live Telemetry
            </h3>
          </div>
          
          <div className="space-y-1.5 font-mono text-[13px] flex-1">
            <MetricRow label="Status" value={isRunning ? 'ACTIVE' : 'STANDBY'} highlight={isRunning ? 'text-emerald-400 font-bold' : 'text-zinc-500'} />
            <MetricRow label="Sample Rate" value={metrics ? `${metrics.sampleRate} Hz` : '--'} />
            <MetricRow label="FFT Size" value={metrics ? metrics.fftSize.toString() : '--'} />
            <MetricRow label="Latency" value={metrics ? `${metrics.latencyMs.toFixed(1)} ms` : '--'} />
            
            <div className="my-5 border-b border-white/10"></div>
            
            <MetricRow label="Dominant Freq" value={metrics ? formatHz(metrics.dominantFrequency) : '--'} highlight="text-indigo-400 font-bold" />
            <MetricRow label="Peak Freq" value={metrics ? formatHz(metrics.peakFrequency) : '--'} />
            
            <div className="my-5 border-b border-white/10"></div>

            <MetricRow label="Peak Amplitude" value={metrics ? metrics.peakAmplitude.toFixed(4) : '--'} />
            <MetricRow label="RMS" value={metrics ? metrics.rms.toFixed(4) : '--'} />
            <MetricRow label="Signal Level" value={metrics ? formatDB(metrics.signalLevelDB) : '--'} />
            
            <div className="my-5 border-b border-white/10"></div>
            
            <div className="flex flex-col mb-2 p-3 bg-black/40 rounded-xl border border-white/5">
              <span className="text-zinc-500 mb-2 text-xs">Band Energy (Linear)</span>
              <span className="text-right font-semibold text-purple-400 text-lg">
                {metrics ? metrics.bandEnergy.toExponential(2) : '--'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricRow = ({ label, value, highlight = '' }: { label: string, value: string, highlight?: string }) => (
  <div className="flex justify-between items-center py-2 hover:bg-white/5 rounded-lg px-2 transition-colors">
    <span className="text-zinc-500">{label}</span>
    <span className={highlight || 'text-zinc-200'}>{value}</span>
  </div>
);

export default LiveAnalyzer;
