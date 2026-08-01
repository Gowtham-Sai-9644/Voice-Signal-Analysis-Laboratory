export interface AudioMetrics {
  rms: number;
  peakAmplitude: number;
  dominantFrequency: number;
  peakFrequency: number;
  signalLevelDB: number;
  bandEnergy: number;
  latencyMs: number;
  sampleRate: number;
  fftSize: number;
}

export interface SessionLog {
  id: string;
  timestamp: string;
  durationMs: number;
  totalSamples: number;
  
  // Amplitudes
  peakAmplitude: number;
  avgRms: number;
  
  // Decibels
  avgSignalDb: number;
  avgNoiseFloorDb: number;
  avgPeakSignalDb: number;
  
  // Frequency
  dominantFreq: number;
  energyBass: number;   // < 250 Hz
  energyMid: number;    // 250 Hz - 4000 Hz
  energyTreble: number; // > 4000 Hz
  
  // Info Theory
  entropy: number;
  snrDb: number;
  capacity: number;
  
  // Arrays
  avgSpectrum: Float32Array;
}

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  
  public isRunning: boolean = false;
  
  // Session tracking
  public sessionHistory: SessionLog[] = [];
  private sessionInterval: number | null = null;
  private sessionStartTime: number = 0;
  
  private runSamples: number = 0;
  private runEntropy: number = 0;
  private runSnrDb: number = 0;
  private runCapacity: number = 0;
  private maxPeakAmp: number = 0;
  private maxDominantFreq: number = 0;
  
  // New Expanded Metrics
  private sumSpectrum: Float32Array | null = null;
  private runRms: number = 0;
  private runSignalDb: number = 0;
  private runNoiseFloorDb: number = 0;
  private runPeakSignalDb: number = 0;
  
  public fftSize: number = 4096;
  
  constructor(fftSize: number = 4096) {
    this.fftSize = fftSize;
  }

  public async getDevices(): Promise<MediaDeviceInfo[]> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return [];
    }
    await navigator.mediaDevices.getUserMedia({ audio: true }); 
    const devices = await navigator.mediaDevices.enumerateDevices();
    let audioInputs = devices.filter(device => device.kind === 'audioinput');
    
    audioInputs.sort((a, b) => {
      const aLabel = a.label.toLowerCase();
      const bLabel = b.label.toLowerCase();
      
      const aIsMic = aLabel.includes('microphone') || aLabel.includes('mic') ? 1 : 0;
      const bIsMic = bLabel.includes('microphone') || bLabel.includes('mic') ? 1 : 0;
      
      const aIsVirtual = aLabel.includes('virtual') || aLabel.includes('cable') ? -1 : 0;
      const bIsVirtual = bLabel.includes('virtual') || bLabel.includes('cable') ? -1 : 0;
      
      const aScore = aIsMic + aIsVirtual;
      const bScore = bIsMic + bIsVirtual;
      
      return bScore - aScore;
    });

    return audioInputs;
  }

  public async startMicrophone(deviceId?: string): Promise<void> {
    try {
      if (this.isRunning) this.stop();

      const audioConstraints: MediaTrackConstraints = {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      };
      if (deviceId) {
        audioConstraints.deviceId = { exact: deviceId };
      }

      const constraints: MediaStreamConstraints = {
        audio: audioConstraints,
        video: false
      };
      
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.fftSize;
      this.analyser.smoothingTimeConstant = 0.8; 
      
      this.mediaStreamSource = this.audioContext.createMediaStreamSource(this.stream);
      this.mediaStreamSource.connect(this.analyser);
      
      this.isRunning = true;
      
      // Start Session Tracking
      this.runSamples = 0;
      this.runEntropy = 0;
      this.runSnrDb = 0;
      this.runCapacity = 0;
      this.maxPeakAmp = 0;
      this.maxDominantFreq = 0;
      
      this.runRms = 0;
      this.runSignalDb = 0;
      this.runNoiseFloorDb = 0;
      this.runPeakSignalDb = 0;
      this.sumSpectrum = new Float32Array(this.analyser.frequencyBinCount);
      
      this.sessionStartTime = performance.now();
      
      // Sample 10 times a second
      this.sessionInterval = window.setInterval(() => this.processSessionTick(), 100);
      
    } catch (err) {
      console.error("Error accessing microphone:", err);
      throw err;
    }
  }

  public stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    // Finalize session
    if (this.sessionInterval !== null) {
      window.clearInterval(this.sessionInterval);
      this.sessionInterval = null;
      this.finalizeSession();
    }
    
    this.isRunning = false;
  }

  private processSessionTick() {
    if (!this.analyser || !this.sumSpectrum) return;
    const freqData = this.getFrequencyData();
    if (freqData.length === 0) return;

    let peakDb = -100;
    let minDb = 100;
    let sumLinear = 0;
    const linearData = new Float32Array(freqData.length);
    
    for (let i = 0; i < freqData.length; i++) {
      // Clamp dB to prevent -Infinity from destroying the running sums
      const db = Math.max(freqData[i], -100);
      this.sumSpectrum[i] += db; 
      
      if (db > peakDb) peakDb = db;
      if (db < minDb) minDb = db;
      
      const power = Math.pow(10, db / 10);
      linearData[i] = power;
      sumLinear += power;
    }

    const noiseFloorDb = Math.max(minDb, -100);
    const snrDb = Math.max(0, peakDb - noiseFloorDb);
    
    let entropy = 0;
    if (sumLinear > 0) {
      for (let i = 0; i < linearData.length; i++) {
        const p = linearData[i] / sumLinear;
        if (p > 0) entropy -= p * Math.log2(p);
      }
    }
    const maxEntropy = Math.log2(linearData.length);
    const normalizedEntropy = entropy / maxEntropy;

    const bandwidth = 20000;
    const linearSnr = Math.pow(10, snrDb / 10);
    const capacity = bandwidth * Math.log2(1 + linearSnr);
    
    const metrics = this.getMetrics();

    this.runSamples++;
    this.runEntropy += normalizedEntropy;
    this.runSnrDb += snrDb;
    this.runCapacity += capacity;
    
    // Advanced logging
    this.runRms += metrics.rms;
    this.runSignalDb += metrics.signalLevelDB;
    this.runNoiseFloorDb += noiseFloorDb;
    this.runPeakSignalDb += peakDb;
    
    if (metrics.peakAmplitude > this.maxPeakAmp) {
      this.maxPeakAmp = metrics.peakAmplitude;
      this.maxDominantFreq = metrics.dominantFrequency;
    }
  }

  private finalizeSession() {
    const durationMs = performance.now() - this.sessionStartTime;
    const samples = Math.max(1, this.runSamples); // Prevent division by zero
    
    // Compute average spectrum
    const avgSpectrum = new Float32Array(this.sumSpectrum ? this.sumSpectrum.length : 0);
    if (this.sumSpectrum) {
      for (let i = 0; i < this.sumSpectrum.length; i++) {
        avgSpectrum[i] = this.sumSpectrum[i] / samples;
      }
    }
    
    // Calculate Band Energies from Average Spectrum
    let energyBass = 0;
    let energyMid = 0;
    let energyTreble = 0;
    let totalEnergy = 0;
    
    if (this.audioContext && avgSpectrum.length > 0) {
      const nyquist = this.audioContext.sampleRate / 2;
      const freqResolution = nyquist / avgSpectrum.length;
      
      for (let i = 0; i < avgSpectrum.length; i++) {
        const freq = i * freqResolution;
        // Convert average dB to linear power for energy comparison
        const power = Math.pow(10, avgSpectrum[i] / 10);
        
        if (freq < 250) {
          energyBass += power;
        } else if (freq < 4000) {
          energyMid += power;
        } else {
          energyTreble += power;
        }
        totalEnergy += power;
      }
    }
    
    // Normalize to percentages
    if (totalEnergy > 0) {
      energyBass = (energyBass / totalEnergy) * 100;
      energyMid = (energyMid / totalEnergy) * 100;
      energyTreble = (energyTreble / totalEnergy) * 100;
    }

    const newSession: SessionLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }),
      durationMs,
      totalSamples: this.runSamples,
      
      dominantFreq: this.maxDominantFreq,
      peakAmplitude: this.maxPeakAmp,
      avgRms: this.runRms / samples,
      
      avgSignalDb: this.runSignalDb / samples,
      avgNoiseFloorDb: this.runNoiseFloorDb / samples,
      avgPeakSignalDb: this.runPeakSignalDb / samples,
      
      energyBass,
      energyMid,
      energyTreble,
      
      entropy: this.runEntropy / samples,
      snrDb: this.runSnrDb / samples,
      capacity: this.runCapacity / samples,
      
      avgSpectrum
    };
    
    this.sessionHistory = [newSession, ...this.sessionHistory].slice(0, 10);
  }

  public getTimeDomainData(): Float32Array {
    if (!this.analyser) return new Float32Array();
    const dataArray = new Float32Array(this.analyser.fftSize);
    this.analyser.getFloatTimeDomainData(dataArray);
    return dataArray;
  }

  public getFrequencyData(): Float32Array {
    if (!this.analyser) return new Float32Array();
    const dataArray = new Float32Array(this.analyser.frequencyBinCount);
    this.analyser.getFloatFrequencyData(dataArray);
    return dataArray;
  }

  public getMetrics(): AudioMetrics {
    if (!this.analyser || !this.audioContext) {
      return {
        rms: 0, peakAmplitude: 0, dominantFrequency: 0, peakFrequency: 0,
        signalLevelDB: -100, bandEnergy: 0, latencyMs: 0, 
        sampleRate: 44100, fftSize: this.fftSize
      };
    }

    const timeData = this.getTimeDomainData();
    const freqData = this.getFrequencyData();
    
    let sumSquares = 0;
    let peakAmplitude = 0;
    for (let i = 0; i < timeData.length; i++) {
      const val = timeData[i];
      sumSquares += val * val;
      if (Math.abs(val) > peakAmplitude) {
        peakAmplitude = Math.abs(val);
      }
    }
    const rms = Math.sqrt(sumSquares / timeData.length);
    const signalLevelDB = rms > 0 ? 20 * Math.log10(rms) : -100;
    
    let maxFreqDb = -100;
    let dominantIndex = 0;
    let bandEnergy = 0;
    
    for (let i = 0; i < freqData.length; i++) {
      const db = Math.max(freqData[i], -100);
      const linearAmp = Math.pow(10, db / 20);
      bandEnergy += linearAmp * linearAmp;
      
      if (db > maxFreqDb) {
        maxFreqDb = db;
        dominantIndex = i;
      }
    }
    
    const nyquist = this.audioContext.sampleRate / 2;
    const freqResolution = nyquist / freqData.length;
    const dominantFrequency = dominantIndex * freqResolution;
    const peakFrequency = dominantFrequency;

    return {
      rms,
      peakAmplitude,
      dominantFrequency,
      peakFrequency,
      signalLevelDB,
      bandEnergy,
      latencyMs: this.audioContext.baseLatency ? this.audioContext.baseLatency * 1000 : 0,
      sampleRate: this.audioContext.sampleRate,
      fftSize: this.analyser.fftSize
    };
  }
}

export const engine = new AudioEngine();
