import React from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  FlipHorizontal,
  Wand2,
  Settings2,
  Radio,
  Tv,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  StreamSource,
  StreamFilter,
  StreamResolution,
  StreamStatus,
} from '../../types';

interface StreamControlsProps {
  source: StreamSource;
  filter: StreamFilter;
  resolution: StreamResolution;
  status: StreamStatus;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isMirrored: boolean;
  cameraDevices: MediaDeviceInfo[];
  activeCameraId: string;
  showLowerThird: boolean;
  onSetSource: (source: StreamSource) => void;
  onSetFilter: (filter: StreamFilter) => void;
  onSetResolution: (res: StreamResolution) => void;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleMirror: () => void;
  onSetActiveCameraId: (id: string) => void;
  onToggleLowerThird: () => void;
  onToggleGoLive: () => void;
}

export const StreamControls: React.FC<StreamControlsProps> = ({
  source,
  filter,
  resolution,
  status,
  isAudioMuted,
  isVideoMuted,
  isMirrored,
  cameraDevices,
  activeCameraId,
  showLowerThird,
  onSetSource,
  onSetFilter,
  onSetResolution,
  onToggleAudio,
  onToggleVideo,
  onToggleMirror,
  onSetActiveCameraId,
  onToggleLowerThird,
  onToggleGoLive,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-900/90 border border-neutral-800 rounded-xl">
      {/* Primary Hardware Toggles */}
      <div className="flex items-center gap-2">
        {/* Mic Toggle */}
        <button
          onClick={onToggleAudio}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
            isAudioMuted
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
              : 'bg-neutral-800 text-neutral-200 hover:text-white hover:bg-neutral-700'
          }`}
        >
          {isAudioMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-400" />}
          <span>{isAudioMuted ? 'Muted' : 'Mic On'}</span>
        </button>

        {/* Camera Toggle */}
        <button
          onClick={onToggleVideo}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
            isVideoMuted
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
              : 'bg-neutral-800 text-neutral-200 hover:text-white hover:bg-neutral-700'
          }`}
        >
          {isVideoMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4 text-emerald-400" />}
          <span>{isVideoMuted ? 'Cam Off' : 'Cam On'}</span>
        </button>

        {/* Screen Share / Switcher */}
        <button
          onClick={() => onSetSource(source === 'screen' ? 'webcam' : 'screen')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            source === 'screen'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700'
          }`}
        >
          <Monitor className="w-4 h-4" />
          <span className="hidden sm:inline">Screen Share</span>
        </button>

        {/* Mirror Cam */}
        <button
          onClick={onToggleMirror}
          title={isMirrored ? 'Video mirrored (Click to unmirror)' : 'Video unmirrored (Click to mirror)'}
          className={`p-2 rounded-lg text-xs transition-colors ${
            isMirrored ? 'bg-neutral-800 text-emerald-400' : 'bg-neutral-800 text-neutral-400 hover:text-white'
          }`}
        >
          <FlipHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Source Selector & Filters */}
      <div className="flex items-center gap-2">
        {/* Source Dropdown */}
        <div className="flex items-center gap-1 bg-neutral-950 px-2 py-1 rounded-lg border border-neutral-800 text-xs">
          <Tv className="w-3.5 h-3.5 text-neutral-400" />
          <select
            value={source}
            onChange={(e) => onSetSource(e.target.value as StreamSource)}
            className="bg-transparent text-neutral-200 focus:outline-none cursor-pointer py-1"
          >
            <option value="webcam" className="bg-neutral-900">Webcam Camera</option>
            <option value="screen" className="bg-neutral-900">Screen Capture</option>
            <option value="wildlife" className="bg-neutral-900">Virtual: Alpine 4K</option>
            <option value="studio" className="bg-neutral-900">Virtual: Studio Room</option>
            <option value="testpattern" className="bg-neutral-900">SMPTE Test Pattern</option>
          </select>
        </div>

        {/* Camera device switcher if multiple webcams available */}
        {cameraDevices.length > 1 && source === 'webcam' && (
          <select
            value={activeCameraId}
            onChange={(e) => onSetActiveCameraId(e.target.value)}
            className="bg-neutral-950 text-neutral-300 border border-neutral-800 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
          >
            {cameraDevices.map((dev, idx) => (
              <option key={dev.deviceId || idx} value={dev.deviceId} className="bg-neutral-900">
                {dev.label || `Camera ${idx + 1}`}
              </option>
            ))}
          </select>
        )}

        {/* Video Filter Preset */}
        <div className="flex items-center gap-1 bg-neutral-950 px-2 py-1 rounded-lg border border-neutral-800 text-xs">
          <Wand2 className="w-3.5 h-3.5 text-neutral-400" />
          <select
            value={filter}
            onChange={(e) => onSetFilter(e.target.value as StreamFilter)}
            className="bg-transparent text-neutral-200 focus:outline-none cursor-pointer py-1"
          >
            <option value="none" className="bg-neutral-900">Filter: Normal</option>
            <option value="studio" className="bg-neutral-900">Filter: Studio Warm</option>
            <option value="cyber" className="bg-neutral-900">Filter: Cyber Teal</option>
            <option value="noir" className="bg-neutral-900">Filter: Film Noir</option>
            <option value="vivid" className="bg-neutral-900">Filter: Vivid Color</option>
            <option value="vintage" className="bg-neutral-900">Filter: Vintage Warm</option>
          </select>
        </div>

        {/* Resolution selector */}
        <select
          value={resolution}
          onChange={(e) => onSetResolution(e.target.value as StreamResolution)}
          className="bg-neutral-950 text-neutral-300 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
        >
          <option value="1080p60" className="bg-neutral-900">1080p 60fps</option>
          <option value="720p60" className="bg-neutral-900">720p 60fps</option>
          <option value="480p30" className="bg-neutral-900">480p 30fps</option>
        </select>

        {/* Overlay toggle */}
        <button
          onClick={onToggleLowerThird}
          title="Toggle Lower-Third Streamer Overlay"
          className={`p-2 rounded-lg text-xs transition-colors ${
            showLowerThird ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-neutral-800 text-neutral-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Main Broadcast Action Button */}
      <div>
        <button
          onClick={onToggleGoLive}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-md ${
            status === 'live'
              ? 'bg-rose-600 hover:bg-rose-700 text-white'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>{status === 'live' ? 'End Broadcast' : 'Go Live'}</span>
        </button>
      </div>
    </div>
  );
};
