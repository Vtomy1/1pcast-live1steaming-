import React from 'react';
import { Eye, Radio, Sparkles } from 'lucide-react';
import { StreamChannel, StreamSource } from '../../types';

interface ChannelBrowserProps {
  currentSource: StreamSource;
  onSelectChannel: (source: StreamSource) => void;
  userStreamerAvatar: string;
}

export const ChannelBrowser: React.FC<ChannelBrowserProps> = ({
  currentSource,
  onSelectChannel,
  userStreamerAvatar,
}) => {
  const channels: StreamChannel[] = [
    {
      id: 'ch_webcam',
      title: 'Broadcaster Studio Cam · Live Creative Stream',
      streamerName: 'Sarah Jenkins',
      streamerAvatar: userStreamerAvatar,
      category: 'IRL & Tech Streaming',
      source: 'webcam',
      thumbnailUrl: userStreamerAvatar,
      viewers: 1420,
      isLive: true,
      tags: ['Live Camera', 'Studio', 'WebRTC'],
    },
    {
      id: 'ch_wildlife',
      title: 'Moraine Alpine Lake 4K Wildlife & Weather Cam',
      streamerName: 'Rocky Mountain Observatory',
      streamerAvatar: '/src/assets/images/channel_wildlife_1793415634219.jpg',
      category: 'Nature & Outdoor Cameras',
      source: 'wildlife',
      thumbnailUrl: '/src/assets/images/channel_wildlife_1793415634219.jpg',
      viewers: 894,
      isLive: true,
      tags: ['4K Camera', 'Alpine Nature', 'Peaceful'],
    },
    {
      id: 'ch_studio',
      title: 'Global Master Control Room · Live Feeds & Switcher',
      streamerName: 'Pulse Broadcast Center',
      streamerAvatar: '/src/assets/images/channel_studio_1793415636592.jpg',
      category: 'Broadcast Engineering',
      source: 'studio',
      thumbnailUrl: '/src/assets/images/channel_studio_1793415636592.jpg',
      viewers: 642,
      isLive: true,
      tags: ['Control Room', 'Multicam', 'Audio Mixer'],
    },
    {
      id: 'ch_testpattern',
      title: 'SMPTE Color Bars & 1kHz Reference Audio Pattern',
      streamerName: 'Standards & Test Labs',
      streamerAvatar: userStreamerAvatar,
      category: 'Technical Test Signal',
      source: 'testpattern',
      thumbnailUrl: '/src/assets/images/channel_studio_1793415636592.jpg',
      viewers: 188,
      isLive: true,
      tags: ['SMPTE', 'Calibration', '1080p60'],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Live Broadcast Channels</h2>
          <p className="text-xs text-neutral-400">Discover and switch live streams across the platform</p>
        </div>
        <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>{channels.length} Streams Active</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {channels.map((ch) => {
          const isActive = currentSource === ch.source;

          return (
            <div
              key={ch.id}
              onClick={() => onSelectChannel(ch.source)}
              className={`group cursor-pointer rounded-xl overflow-hidden border transition-all duration-200 bg-neutral-900 ${
                isActive
                  ? 'border-rose-500 ring-1 ring-rose-500/50 shadow-lg'
                  : 'border-neutral-800 hover:border-neutral-700 hover:shadow-md'
              }`}
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full bg-neutral-950 overflow-hidden">
                <img
                  src={ch.thumbnailUrl}
                  alt={ch.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Live tag */}
                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold uppercase tracking-wider">
                  <Radio className="w-3 h-3" />
                  <span>LIVE</span>
                </div>

                {/* Viewers count */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-black/70 backdrop-blur-sm text-white rounded text-[11px] font-mono tabular-nums">
                  <Eye className="w-3 h-3 text-neutral-400" />
                  <span>{ch.viewers.toLocaleString()}</span>
                </div>

                {isActive && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold uppercase">
                    Watching Now
                  </div>
                )}
              </div>

              {/* Channel Meta */}
              <div className="p-3">
                <div className="flex items-start gap-2.5">
                  <img
                    src={ch.streamerAvatar}
                    alt={ch.streamerName}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover shrink-0 border border-neutral-700"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-white truncate group-hover:text-rose-400 transition-colors">
                      {ch.title}
                    </h3>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">{ch.streamerName}</p>
                    <p className="text-[10px] text-neutral-500 truncate">{ch.category}</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-1 mt-2.5 text-[10px] text-neutral-400">
                  {ch.tags.map((t, idx) => (
                    <React.Fragment key={t}>
                      <span>{t}</span>
                      {idx < ch.tags.length - 1 && <span aria-hidden="true">·</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
