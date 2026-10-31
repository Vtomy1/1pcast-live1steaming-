import React from 'react';
import { Radio } from 'lucide-react';
import { AppView, StreamStatus } from '../../types';

interface HeaderProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  streamStatus: StreamStatus;
  uptime: string;
  onToggleGoLive: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSelectView,
  streamStatus,
  uptime,
  onToggleGoLive,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-neutral-950 border-b border-neutral-800/80 sticky top-0 z-40 select-none">
      {/* Zone 1: Wordmark in single text element */}
      <div className="flex items-center gap-2 shrink-0">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSelectView('studio');
          }}
          className="text-lg font-extrabold tracking-tight text-white hover:text-rose-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <div className="w-7 h-7 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-md">
            <Radio className="w-4 h-4" />
          </div>
          <span>PulseCast</span>
        </a>
      </div>

      {/* Zone 2: 4 Clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
        <button
          onClick={() => onSelectView('studio')}
          className={`transition-colors whitespace-nowrap shrink-0 ${
            currentView === 'studio'
              ? 'text-white font-semibold border-b-2 border-rose-500 pb-0.5'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Broadcast Studio
        </button>

        <button
          onClick={() => onSelectView('theater')}
          className={`transition-colors whitespace-nowrap shrink-0 ${
            currentView === 'theater'
              ? 'text-white font-semibold border-b-2 border-rose-500 pb-0.5'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Theater Player
        </button>

        <button
          onClick={() => onSelectView('channels')}
          className={`transition-colors whitespace-nowrap shrink-0 ${
            currentView === 'channels'
              ? 'text-white font-semibold border-b-2 border-rose-500 pb-0.5'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Live Channels
        </button>

        <button
          onClick={() => onSelectView('analytics')}
          className={`transition-colors whitespace-nowrap shrink-0 ${
            currentView === 'analytics'
              ? 'text-white font-semibold border-b-2 border-rose-500 pb-0.5'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Real-Time Analytics
        </button>
      </nav>

      {/* Zone 3: 1 Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleGoLive}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all shadow-md whitespace-nowrap shrink-0 flex items-center gap-2 ${
            streamStatus === 'live'
              ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>{streamStatus === 'live' ? `On Air (${uptime})` : 'Go Live Now'}</span>
        </button>
      </div>
    </header>
  );
};
