import React, { useState, useEffect } from 'react';
import {
  Maximize2,
  Minimize2,
  Camera,
  Circle,
  Eye,
  Radio,
  VideoOff,
  Sparkles,
  PictureInPicture,
} from 'lucide-react';
import {
  StreamFilter,
  StreamStatus,
  FloatingReaction,
} from '../../types';

interface VideoPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  streamStatus: StreamStatus;
  streamTitle: string;
  streamerName: string;
  filter: StreamFilter;
  isMirrored: boolean;
  isVideoMuted: boolean;
  isRecording: boolean;
  recordingSeconds: number;
  viewers: number;
  fps: number;
  resolution: string;
  uptime: string;
  reactions: FloatingReaction[];
  showLowerThird: boolean;
  onTakeSnapshot: () => void;
  onToggleRecording: () => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoRef,
  streamStatus,
  streamTitle,
  streamerName,
  filter,
  isMirrored,
  isVideoMuted,
  isRecording,
  recordingSeconds,
  viewers,
  fps,
  resolution,
  uptime,
  reactions,
  showLowerThird,
  onTakeSnapshot,
  onToggleRecording,
}) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControlsOverlay, setShowControlsOverlay] = useState<boolean>(true);
  const playerContainerRef = React.useRef<HTMLDivElement | null>(null);

  // CSS filter styles
  const getFilterStyle = (f: StreamFilter): string => {
    switch (f) {
      case 'studio':
        return 'contrast(1.1) saturate(1.2) brightness(1.05)';
      case 'cyber':
        return 'contrast(1.3) hue-rotate(165deg) saturate(1.4)';
      case 'noir':
        return 'grayscale(1) contrast(1.3) brightness(0.95)';
      case 'vivid':
        return 'saturate(1.6) contrast(1.15)';
      case 'vintage':
        return 'sepia(0.35) contrast(1.08) brightness(0.95) saturate(1.1)';
      default:
        return 'none';
    }
  };

  const toggleFullscreen = async () => {
    const el = playerContainerRef.current;
    if (!el) return;

    if (!document.fullscreenElement) {
      try {
        await el.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.warn('Fullscreen failed:', err);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (err) {
        console.warn('Exit fullscreen failed:', err);
      }
    }
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch (e) {
      console.warn('Picture in picture failed:', e);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div
      ref={playerContainerRef}
      onMouseEnter={() => setShowControlsOverlay(true)}
      className="relative w-full aspect-video bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 shadow-2xl flex items-center justify-center group select-none"
    >
      {/* Underlying Video Stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transition-transform duration-200 ${
          isMirrored ? '-scale-x-100' : ''
        }`}
        style={{
          filter: getFilterStyle(filter),
          display: isVideoMuted ? 'none' : 'block',
        }}
      />

      {/* Video Muted / Off State */}
      {isVideoMuted && (
        <div className="flex flex-col items-center justify-center gap-3 text-neutral-400">
          <div className="p-4 rounded-full bg-neutral-900 border border-neutral-800">
            <VideoOff className="w-8 h-8 text-neutral-500" />
          </div>
          <span className="text-sm font-medium">Camera Feed Paused</span>
        </div>
      )}

      {/* Floating Reactions Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {reactions.map((r) => (
          <div
            key={r.id}
            className="absolute bottom-6 animate-float-fade transition-transform"
            style={{
              left: `${r.x}%`,
              fontSize: `${r.size}px`,
              animation: 'floatUp 2.4s ease-out forwards',
            }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translateY(0) scale(0.8) rotate(0deg);
          }
          50% {
            opacity: 0.9;
            transform: translateY(-120px) scale(1.2) rotate(10deg);
          }
          100% {
            opacity: 0;
            transform: translateY(-260px) scale(1.4) rotate(-15deg);
          }
        }
      `}</style>

      {/* Top HUD Bar: Status & Telemetry */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2">
          {streamStatus === 'live' ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-600 text-white rounded text-xs font-bold tracking-wider uppercase shadow-md">
              <Radio className="w-3.5 h-3.5" />
              <span>LIVE</span>
              <span className="text-rose-200 font-mono font-normal ml-1 tabular-nums">{uptime}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-800/90 text-neutral-300 rounded text-xs font-medium backdrop-blur-sm border border-neutral-700">
              <Circle className="w-2.5 h-2.5 fill-neutral-500 text-neutral-500" />
              <span>OFFLINE PREVIEW</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900/80 backdrop-blur-md text-neutral-200 rounded text-xs font-mono border border-neutral-800">
            <Eye className="w-3.5 h-3.5 text-neutral-400" />
            <span className="tabular-nums font-semibold">{viewers.toLocaleString()}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-neutral-900/70 backdrop-blur-md text-neutral-300 rounded text-xs font-mono border border-neutral-800 tabular-nums">
            <span>{resolution}</span>
            <span className="text-neutral-500">·</span>
            <span className={fps >= 55 ? 'text-emerald-400' : 'text-amber-400'}>{fps} FPS</span>
          </div>
        </div>

        {/* Recording active badge */}
        {isRecording && (
          <div className="flex items-center gap-2 px-2.5 py-1 bg-rose-500/90 text-white rounded text-xs font-mono font-semibold animate-pulse shadow-lg">
            <div className="w-2 h-2 rounded-full bg-white" />
            <span>REC {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}</span>
          </div>
        )}
      </div>

      {/* Lower Third Streamer Banner */}
      {showLowerThird && (
        <div className="absolute bottom-14 left-4 z-10 transition-all duration-300 max-w-sm pointer-events-none">
          <div className="bg-neutral-950/85 backdrop-blur-md border border-neutral-700/60 rounded-lg p-2.5 shadow-xl">
            <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider">{streamerName}</div>
            <div className="text-sm font-bold text-white truncate">{streamTitle}</div>
          </div>
        </div>
      )}

      {/* Hover Floating Controls Bar */}
      <div
        className={`absolute bottom-3 left-3 right-3 flex items-center justify-between transition-opacity duration-200 z-20 ${
          showControlsOverlay ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-1.5 bg-neutral-900/85 backdrop-blur-md p-1 rounded-lg border border-neutral-800">
          <button
            onClick={onTakeSnapshot}
            title="Take High-Res Snapshot (PNG)"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 rounded transition-colors"
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Snapshot</span>
          </button>

          <button
            onClick={onToggleRecording}
            title={isRecording ? 'Stop & Download Recording' : 'Start Stream Recording (WebM)'}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded transition-colors ${
              isRecording
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Circle className={`w-3.5 h-3.5 ${isRecording ? 'fill-white text-white' : 'fill-rose-500 text-rose-500'}`} />
            <span className="hidden sm:inline">{isRecording ? 'Stop REC' : 'Record'}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 bg-neutral-900/85 backdrop-blur-md p-1 rounded-lg border border-neutral-800">
          <button
            onClick={togglePiP}
            title="Picture in Picture"
            className="p-1.5 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded transition-colors"
          >
            <PictureInPicture className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className="p-1.5 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
