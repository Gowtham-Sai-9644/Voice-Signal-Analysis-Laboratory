import { useState, useRef, useEffect } from 'react';
import type { DragEvent } from 'react';
import { UploadCloud, FileAudio, Play, Pause, Square } from 'lucide-react';

const AudioUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);

  const overviewCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      alert("Please upload a valid audio file.");
      return;
    }
    
    setAudioFile(file);
    setIsDecoding(true);
    stopAudio();
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      if (!audioContextRef.current) return;
      
      const buffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      setAudioBuffer(buffer);
      drawOverviewWaveform(buffer);
    } catch (err) {
      console.error("Error decoding audio:", err);
      alert("Failed to decode audio file.");
    } finally {
      setIsDecoding(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const drawOverviewWaveform = (buffer: AudioBuffer) => {
    const canvas = overviewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, width, height);
    
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    const data = buffer.getChannelData(0); 
    const step = Math.ceil(data.length / width);
    const amp = height / 2;
    
    ctx.fillStyle = '#818cf8'; // indigo-400

    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = data[(i * step) + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      
      const y1 = (1 + min) * amp;
      const y2 = (1 + max) * amp;
      
      ctx.fillRect(i, y1, 1, y2 - y1 || 1);
    }
  };

  const togglePlay = () => {
    if (!audioContextRef.current || !audioBuffer) return;

    if (isPlaying) {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      }
      pauseTimeRef.current += audioContextRef.current.currentTime - startTimeRef.current;
      setIsPlaying(false);
    } else {
      sourceNodeRef.current = audioContextRef.current.createBufferSource();
      sourceNodeRef.current.buffer = audioBuffer;
      sourceNodeRef.current.connect(audioContextRef.current.destination);
      
      const offset = pauseTimeRef.current % audioBuffer.duration;
      sourceNodeRef.current.start(0, offset);
      startTimeRef.current = audioContextRef.current.currentTime;
      
      sourceNodeRef.current.onended = () => {
        if (audioContextRef.current && sourceNodeRef.current) {
           setIsPlaying(false);
           pauseTimeRef.current = 0;
        }
      };
      
      setIsPlaying(true);
    }
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.onended = null;
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
    }
    setIsPlaying(false);
    pauseTimeRef.current = 0;
    startTimeRef.current = 0;
  };

  return (
    <div className="space-y-6 h-full flex flex-col font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/5 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/10 space-y-4 sm:space-y-0">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center">
          <UploadCloud className="mr-3 text-indigo-400" /> Audio Upload & Offline Analysis
        </h2>
      </div>

      {!audioBuffer && (
        <div 
          className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl transition-all shadow-xl bg-white/5 backdrop-blur-md
            ${isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 hover:border-white/20'}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDecoding ? (
             <div className="flex flex-col items-center text-zinc-400">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
               <p className="font-mono text-sm">Decoding Audio Buffer...</p>
             </div>
          ) : (
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-black/40 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-white/5">
                <UploadCloud size={32} className="text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Drag and drop audio files here</h3>
              <p className="text-sm text-zinc-400 mb-8 font-medium">Supports WAV, MP3, OGG</p>
              
              <label className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/25 cursor-pointer inline-block">
                Browse Files
                <input type="file" className="hidden" accept="audio/*" onChange={handleFileInput} />
              </label>
            </div>
          )}
        </div>
      )}

      {audioBuffer && (
        <div className="flex-1 flex flex-col space-y-6 min-h-0">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/5 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/10 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20 text-indigo-400 shadow-inner">
                <FileAudio size={24} />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">{audioFile?.name}</h3>
                <p className="text-xs font-mono text-zinc-400">
                  {audioBuffer.sampleRate} Hz | {audioBuffer.numberOfChannels} Ch | {audioBuffer.duration.toFixed(2)} sec
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button onClick={togglePlay} className="bg-white hover:bg-zinc-200 text-black px-5 py-2 rounded-lg text-sm font-bold transition-colors flex items-center shadow-lg shadow-white/10">
                {isPlaying ? <Pause size={16} className="mr-2" /> : <Play size={16} className="mr-2" />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button onClick={stopAudio} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white p-2 rounded-lg transition-colors flex items-center">
                <Square size={16} />
              </button>
              
              <div className="w-px h-6 bg-white/10 mx-2"></div>
              
              <button onClick={() => setAudioBuffer(null)} className="text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-4 py-2 rounded-lg transition-colors border border-red-500/20">
                Clear File
              </button>
            </div>
          </div>

          <div className="flex flex-col relative bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-hidden h-64 p-3">
             <div className="absolute top-5 left-5 px-3 py-1.5 bg-black/80 rounded-lg text-[10px] font-mono text-zinc-300 pointer-events-none z-10 uppercase tracking-widest font-bold backdrop-blur-md border border-white/5 shadow-lg">
               Overview Waveform
             </div>
             <div className="w-full h-full bg-black/40 rounded-xl relative overflow-hidden border border-white/5">
                <canvas 
                    ref={overviewCanvasRef}
                    width={1600}
                    height={250}
                    className="w-full h-full absolute inset-0 object-fill mix-blend-screen"
                />
             </div>
          </div>

           <div className="flex-1 min-h-[250px] md:min-h-0 flex flex-col relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl items-center justify-center shadow-inner">
             <p className="font-mono text-sm text-zinc-500 font-medium">Detailed Analysis Zoom View (Coming in Next Phase)</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioUpload;
