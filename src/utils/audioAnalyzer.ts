/**
 * Web Audio API helper for computing live audio levels (dBFS, RMS, and frequency spectrum)
 */

export interface AudioLevels {
  peakDb: number;      // -60 to 0 dBFS
  rmsDb: number;       // -60 to 0 dBFS
  volumePercent: number; // 0 to 100%
  frequencyData: Uint8Array;
}

export class AudioStreamMeter {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private synthOscillator: OscillatorNode | null = null;
  private synthGain: GainNode | null = null;
  private dataArray: Uint8Array | null = null;
  private isSynthesizing = false;

  public initStream(stream: MediaStream): void {
    this.cleanup();

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0 && audioTracks[0].enabled) {
        this.sourceNode = this.audioCtx.createMediaStreamSource(stream);
        this.sourceNode.connect(this.analyser);
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      } else {
        this.setupSynthesizedAmbience();
      }
    } catch (err) {
      console.warn('Audio metering init error, falling back to synthesis:', err);
      this.setupSynthesizedAmbience();
    }
  }

  public setupSynthesizedAmbience(): void {
    if (this.synthOscillator) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.audioCtx) {
        this.audioCtx = new AudioCtxClass();
      }
      if (!this.analyser) {
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 256;
      }

      // Generate quiet ambient pink/brown tone for studio test simulation
      this.synthOscillator = this.audioCtx.createOscillator();
      this.synthGain = this.audioCtx.createGain();
      this.synthGain.gain.value = 0.0001; // subtle so it doesn't blast user speakers, but generates spectrum
      this.synthOscillator.frequency.value = 220;
      this.synthOscillator.connect(this.synthGain);
      this.synthGain.connect(this.analyser);
      this.synthOscillator.start();
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.isSynthesizing = true;
    } catch {
      // Ignore audio synthesis errors
    }
  }

  public getLevels(): AudioLevels {
    if (!this.analyser || !this.dataArray) {
      return {
        peakDb: -60,
        rmsDb: -60,
        volumePercent: 0,
        frequencyData: new Uint8Array(32),
      };
    }

    // Get time-domain data for RMS and Peak
    const timeData = new Uint8Array(this.analyser.fftSize);
    this.analyser.getByteTimeDomainData(timeData as unknown as Uint8Array<ArrayBuffer>);
    this.analyser.getByteFrequencyData(this.dataArray as unknown as Uint8Array<ArrayBuffer>);

    let sumSquares = 0;
    let peak = 0;

    for (let i = 0; i < timeData.length; i++) {
      // timeData is normalized around 128 (0 signal = 128)
      const normalized = (timeData[i] - 128) / 128;
      const absVal = Math.abs(normalized);
      if (absVal > peak) peak = absVal;
      sumSquares += normalized * normalized;
    }

    const rms = Math.sqrt(sumSquares / timeData.length);

    // Convert to decibels full scale (dBFS)
    // 0 is maximum digital level, -60 is practical silence floor
    const peakDb = peak > 0.001 ? Math.max(-60, 20 * Math.log10(peak)) : -60;
    const rmsDb = rms > 0.001 ? Math.max(-60, 20 * Math.log10(rms)) : -60;

    // Linear percentage for UI VU meter (0% at -60dB, 100% at 0dB)
    const volumePercent = Math.min(100, Math.max(0, ((peakDb + 60) / 60) * 100));

    return {
      peakDb: Math.round(peakDb * 10) / 10,
      rmsDb: Math.round(rmsDb * 10) / 10,
      volumePercent: Math.round(volumePercent),
      frequencyData: this.dataArray,
    };
  }

  public cleanup(): void {
    if (this.synthOscillator) {
      try {
        this.synthOscillator.stop();
        this.synthOscillator.disconnect();
      } catch {
        // ignore
      }
      this.synthOscillator = null;
    }
    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch {
        // ignore
      }
      this.sourceNode = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      try {
        this.audioCtx.close();
      } catch {
        // ignore
      }
      this.audioCtx = null;
    }
    this.analyser = null;
    this.dataArray = null;
    this.isSynthesizing = false;
  }
}
