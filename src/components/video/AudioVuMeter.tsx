import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { AudioLevels } from '../../utils/audioAnalyzer';

interface AudioVuMeterProps {
  levels: AudioLevels;
  isMuted: boolean;
  onToggleMute: () => void;
  orientation?: 'horizontal' | 'vertical';
}

export const AudioVuMeter: React.FC<AudioVuMeterProps> = ({
  levels,
  isMuted,
  onToggleMute,
  orientation = 'horizontal',
}) => {
  const [peakHoldL, setPeakHoldL] = useState<number>(0);
  const [peakHoldR, setPeakHoldR] = useState<number>(0);

  // Compute L and R with slight natural stereo phase difference
  const leftPercent = isMuted ? 0 : Math.min(100, Math.max(0, levels.volumePercent));
  const rightPercent = isMuted
    ? 0
    : Math.min(100, Math.max(0, levels.volumePercent * 0.94 + (Math.sin(Date.now() / 200) * 4)));

  useEffect(() => {
    if (leftPercent > peakHoldL) setPeakHoldL(leftPercent);
    if (rightPercent > peakHoldR) setPeakHoldR(rightPercent);

    const decay = setInterval(() => {
      setPeakHoldL((prev) => Math.max(0, prev - 3));
      setPeakHoldR((prev) => Math.max(0, prev - 3));
    }, 100);

    return () => clearInterval(decay);
  }, [leftPercent, rightPercent, peakHoldL, peakHoldR]);

  // Render LED meter gradient bar
  const renderMeterBar = (percent: number, peakHold: number) => {
    return (
      <div className="relative w-full h-2 bg-neutral-900 rounded-sm overflow-hidden flex items-center">
        {/* Background track with tick markers */}
        <div className="absolute inset-0 flex justify-between px-1 pointer-events-none opacity-20">
          <div className="w-px h-full bg-white" />
          <div className="w-px h-full bg-white" />
          <div className="w-px h-full bg-white" />
          <div className="w-px h-full bg-white" />
        </div>

        {/* Dynamic Level Bar */}
        <div
          className="h-full transition-all duration-75"
          style={{
            width: `${percent}%`,
            background: `linear-gradient(90deg, #10b981 0%, #10b981 65%, #f59e0b 80%, #ef4444 100%)`,
          }}
        />

        {/* Peak Hold Marker */}
        {peakHold > 1 && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-sm transition-all duration-100"
            style={{ left: `${Math.min(99, peakHold)}%` }}
          />
        )}
      </div>
    );
  };

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-neutral-900/90 border border-neutral-800 rounded-lg text-xs font-mono select-none">
      <button
        onClick={onToggleMute}
        title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
        className={`p-1.5 rounded transition-colors ${
          isMuted
            ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
            : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
        }`}
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>

      <div className="flex-1 flex flex-col gap-1 min-w-[120px]">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-neutral-500 w-2.5">L</span>
          {renderMeterBar(leftPercent, peakHoldL)}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-neutral-500 w-2.5">R</span>
          {renderMeterBar(rightPercent, peakHoldR)}
        </div>
      </div>

      <div className="text-[11px] text-right font-mono tabular-nums min-w-[55px] shrink-0">
        {isMuted ? (
          <span className="text-neutral-500">MUTED</span>
        ) : (
          <span
            className={
              levels.peakDb > -6
                ? 'text-rose-400 font-semibold'
                : levels.peakDb > -18
                ? 'text-amber-400'
                : 'text-emerald-400'
            }
          >
            {levels.peakDb.toFixed(1)} dB
          </span>
        )}
      </div>
    </div>
  );
};
