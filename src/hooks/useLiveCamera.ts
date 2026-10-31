import { useState, useEffect, useRef, useCallback } from 'react';
import { StreamSource, StreamFilter, StreamResolution } from '../types';
import { AudioStreamMeter, AudioLevels } from '../utils/audioAnalyzer';

export interface UseLiveCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  mediaStream: MediaStream | null;
  source: StreamSource;
  filter: StreamFilter;
  resolution: StreamResolution;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isMirrored: boolean;
  isRecording: boolean;
  recordingSeconds: number;
  cameraDevices: MediaDeviceInfo[];
  activeCameraId: string;
  error: string | null;
  audioLevels: AudioLevels;
  isVirtualStream: boolean;
  hasHardwareCamera: boolean;
  // Actions
  setSource: (source: StreamSource) => void;
  setFilter: (filter: StreamFilter) => void;
  setResolution: (res: StreamResolution) => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  toggleMirror: () => void;
  setActiveCameraId: (deviceId: string) => void;
  startRecording: () => void;
  stopRecording: () => void;
  takeSnapshot: () => string | null;
  retryCamera: () => void;
}

export function useLiveCamera(): UseLiveCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const audioMeterRef = useRef<AudioStreamMeter>(new AudioStreamMeter());
  const animationFrameRef = useRef<number | null>(null);

  const [source, setSource] = useState<StreamSource>('webcam');
  const [filter, setFilter] = useState<StreamFilter>('none');
  const [resolution, setResolution] = useState<StreamResolution>('1080p60');
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(false);
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeCameraId, setActiveCameraId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [hasHardwareCamera, setHasHardwareCamera] = useState<boolean>(true);
  const [audioLevels, setAudioLevels] = useState<AudioLevels>({
    peakDb: -60,
    rmsDb: -60,
    volumePercent: 0,
    frequencyData: new Uint8Array(32),
  });

  // Track recording timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Enumerate media devices
  const enumerateDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        setHasHardwareCamera(false);
        return;
      }
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      setCameraDevices(videoInputs);
      if (videoInputs.length === 0) {
        setHasHardwareCamera(false);
      } else {
        setHasHardwareCamera(true);
        if (!activeCameraId && videoInputs[0]) {
          setActiveCameraId(videoInputs[0].deviceId);
        }
      }
    } catch (e) {
      console.warn('Failed to enumerate devices:', e);
      setHasHardwareCamera(false);
    }
  }, [activeCameraId]);

  // Audio level polling
  useEffect(() => {
    let active = true;
    const pollAudio = () => {
      if (!active) return;
      if (audioMeterRef.current) {
        const levels = audioMeterRef.current.getLevels();
        // If audio is muted by user, force -60dB
        if (isAudioMuted) {
          setAudioLevels({
            peakDb: -60,
            rmsDb: -60,
            volumePercent: 0,
            frequencyData: new Uint8Array(32),
          });
        } else {
          setAudioLevels(levels);
        }
      }
      animationFrameRef.current = requestAnimationFrame(pollAudio);
    };

    animationFrameRef.current = requestAnimationFrame(pollAudio);

    return () => {
      active = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isAudioMuted]);

  // Clean up stream tracks
  const stopCurrentStream = useCallback(() => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
    audioMeterRef.current.cleanup();
  }, [mediaStream]);

  // Generate virtual stream canvas (for simulated wildlife, control room, or SMPTE bars)
  const createVirtualStream = useCallback((type: 'wildlife' | 'studio' | 'testpattern') => {
    stopCurrentStream();
    setError(null);

    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let t = 0;

    // Load pre-generated images for wildlife and studio
    const imgWildlife = new Image();
    imgWildlife.src = '/src/assets/images/channel_wildlife_1793415634219.jpg';
    const imgStudio = new Image();
    imgStudio.src = '/src/assets/images/channel_studio_1793415636592.jpg';

    const render = () => {
      t += 0.03;
      if (type === 'wildlife') {
        if (imgWildlife.complete && imgWildlife.naturalWidth > 0) {
          // Slow cinematic pan
          const scale = 1.05 + Math.sin(t * 0.2) * 0.03;
          const shiftX = Math.sin(t * 0.1) * 20;
          ctx.save();
          ctx.translate(canvas.width / 2 + shiftX, canvas.height / 2);
          ctx.scale(scale, scale);
          ctx.drawImage(imgWildlife, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
          ctx.restore();

          // Subtle mist overlay
          ctx.fillStyle = `rgba(255, 255, 255, ${0.05 + Math.sin(t * 0.5) * 0.02})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      } else if (type === 'studio') {
        if (imgStudio.complete && imgStudio.naturalWidth > 0) {
          ctx.drawImage(imgStudio, 0, 0, canvas.width, canvas.height);

          // Simulated studio tally & monitor blinks
          const blink = Math.sin(t * 4) > 0;
          ctx.fillStyle = blink ? 'rgba(239, 68, 68, 0.9)' : 'rgba(185, 28, 28, 0.7)';
          ctx.fillRect(40, 40, 24, 24);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px "JetBrains Mono", monospace';
          ctx.fillText('PGM 1 LIVE', 72, 57);
        } else {
          ctx.fillStyle = '#090d16';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      } else if (type === 'testpattern') {
        // SMPTE Color Bars
        const colors = [
          '#c0c0c0', // 75% White
          '#c0c000', // Yellow
          '#00c0c0', // Cyan
          '#00c000', // Green
          '#c000c0', // Magenta
          '#c00000', // Red
          '#0000c0', // Blue
        ];
        const barWidth = canvas.width / colors.length;
        for (let i = 0; i < colors.length; i++) {
          ctx.fillStyle = colors[i];
          ctx.fillRect(i * barWidth, 0, barWidth, canvas.height * 0.67);
        }
        // Lower split bars
        const lowerColors = ['#0000c0', '#131313', '#c000c0', '#131313', '#00c0c0', '#131313', '#c0c0c0'];
        for (let i = 0; i < lowerColors.length; i++) {
          ctx.fillStyle = lowerColors[i];
          ctx.fillRect(i * barWidth, canvas.height * 0.67, barWidth, canvas.height * 0.33);
        }
        // Digital clock & test text
        ctx.fillStyle = '#000000';
        ctx.fillRect(canvas.width / 2 - 160, canvas.height / 2 - 25, 320, 50);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`SMPTE 1080p60 · ${new Date().toLocaleTimeString()}`, canvas.width / 2, canvas.height / 2 + 7);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    const canvasStream = canvas.captureStream(60);

    // Create synthetic audio for the virtual stream
    audioMeterRef.current.setupSynthesizedAmbience();

    if (videoRef.current) {
      videoRef.current.srcObject = canvasStream;
      videoRef.current.play().catch(() => {});
    }
    setMediaStream(canvasStream);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [stopCurrentStream]);

  // Request actual camera stream
  const startCamera = useCallback(async (deviceId?: string) => {
    stopCurrentStream();
    setError(null);

    const resConstraints = {
      '1080p60': { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 60 } },
      '720p60': { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 60 } },
      '480p30': { width: { ideal: 854 }, height: { ideal: 480 }, frameRate: { ideal: 30 } },
    }[resolution];

    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId }, ...resConstraints }
          : { facingMode: 'user', ...resConstraints },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setMediaStream(stream);
      setHasHardwareCamera(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.warn('Video play error:', e));
      }

      // Initialize real audio meter
      audioMeterRef.current.initStream(stream);

      // Re-enumerate to get labeled devices
      enumerateDevices();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn('getUserMedia failed, falling back to simulated studio camera:', errMsg);
      setError('Live camera access unavailable (or blocked). Switched to high-fidelity Simulated Studio Feed.');
      setSource('studio');
      createVirtualStream('studio');
    }
  }, [resolution, stopCurrentStream, enumerateDevices, createVirtualStream]);

  // Request screen share
  const startScreenShare = useCallback(async () => {
    stopCurrentStream();
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 60 } },
        audio: true,
      });

      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }

      audioMeterRef.current.initStream(stream);

      // Listen for user stopping screen share via browser bar
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          setSource('webcam');
          startCamera();
        };
      }
    } catch (err) {
      console.warn('Screen share cancelled/failed:', err);
      setError('Screen sharing was cancelled. Switched back to camera.');
      setSource('webcam');
      startCamera();
    }
  }, [stopCurrentStream, startCamera]);

  // Main source switcher effect
  useEffect(() => {
    enumerateDevices();

    if (source === 'webcam') {
      startCamera(activeCameraId);
    } else if (source === 'screen') {
      startScreenShare();
    } else if (source === 'wildlife') {
      const cleanup = createVirtualStream('wildlife');
      return cleanup;
    } else if (source === 'studio') {
      const cleanup = createVirtualStream('studio');
      return cleanup;
    } else if (source === 'testpattern') {
      const cleanup = createVirtualStream('testpattern');
      return cleanup;
    }

    return () => {
      // unmount cleanup handled by stopCurrentStream
    };
  }, [source, activeCameraId, resolution]);

  // Toggle audio track mute
  const toggleAudio = useCallback(() => {
    setIsAudioMuted((prev) => {
      const nextState = !prev;
      if (mediaStream) {
        mediaStream.getAudioTracks().forEach((track) => {
          track.enabled = !nextState;
        });
      }
      return nextState;
    });
  }, [mediaStream]);

  // Toggle video track mute
  const toggleVideo = useCallback(() => {
    setIsVideoMuted((prev) => {
      const nextState = !prev;
      if (mediaStream) {
        mediaStream.getVideoTracks().forEach((track) => {
          track.enabled = !nextState;
        });
      }
      return nextState;
    });
  }, [mediaStream]);

  const toggleMirror = useCallback(() => {
    setIsMirrored((prev) => !prev);
  }, []);

  // Recording controls
  const startRecording = useCallback(() => {
    if (!mediaStream) return;
    try {
      recordedChunksRef.current = [];
      const options = { mimeType: 'video/webm;codecs=vp9,opus' };
      const recorder = new MediaRecorder(
        mediaStream,
        MediaRecorder.isTypeSupported(options.mimeType) ? options : undefined
      );

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `pulsecast-recording-${new Date().toISOString().replace(/[:.]/g, '-')}.webm`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
      };

      recorder.start(1000); // 1-second chunks
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start MediaRecorder:', err);
    }
  }, [mediaStream]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  // High-res snapshot capture
  const takeSnapshot = useCallback(() => {
    const video = videoRef.current;
    if (!video) return null;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Apply mirror if enabled and webcam
      if (isMirrored && source === 'webcam') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `pulsecast-snapshot-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return dataUrl;
    } catch (e) {
      console.error('Snapshot capture error:', e);
      return null;
    }
  }, [isMirrored, source]);

  const retryCamera = useCallback(() => {
    setError(null);
    setSource('webcam');
    startCamera(activeCameraId);
  }, [activeCameraId, startCamera]);

  return {
    videoRef,
    canvasRef,
    mediaStream,
    source,
    filter,
    resolution,
    isAudioMuted,
    isVideoMuted,
    isMirrored,
    isRecording,
    recordingSeconds,
    cameraDevices,
    activeCameraId,
    error,
    audioLevels,
    isVirtualStream: source !== 'webcam' && source !== 'screen',
    hasHardwareCamera,
    setSource,
    setFilter,
    setResolution,
    toggleAudio,
    toggleVideo,
    toggleMirror,
    setActiveCameraId,
    startRecording,
    stopRecording,
    takeSnapshot,
    retryCamera,
  };
}
