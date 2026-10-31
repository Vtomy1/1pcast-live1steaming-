import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Radio,
  Eye,
  Heart,
  Share2,
  Edit3,
  Check,
  Circle,
  Activity,
  Layers,
  Sparkles,
  Camera,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

import {
  AppView,
  StreamStatus,
  ChatMessage,
  Poll,
  FloatingReaction,
  UserBadge,
} from './types';
import { useLiveCamera } from './hooks/useLiveCamera';
import { useStreamTelemetry } from './hooks/useStreamTelemetry';

import { Header } from './components/common/Header';
import { VideoPlayer } from './components/video/VideoPlayer';
import { AudioVuMeter } from './components/video/AudioVuMeter';
import { StreamControls } from './components/video/StreamControls';
import { LiveChat } from './components/chat/LiveChat';
import { SuperChatModal } from './components/chat/SuperChatModal';
import { CreatePollModal } from './components/chat/CreatePollModal';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { ChannelBrowser } from './components/channels/ChannelBrowser';
import { ShareModal } from './components/video/ShareModal';
import { BitrateViewerChart } from './components/analytics/BitrateViewerChart';

const STREAMER_AVATAR = '/src/assets/images/streamer_avatar_1793415635170.jpg';

// Initial seed chat messages
const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_1',
    userId: 'u_mod_1',
    userName: 'Elena_StreamOps',
    userBadge: 'mod',
    userColor: '#34d399',
    text: 'Welcome everyone to PulseCast Studio! Drop a reaction or cheer to test the live stream.',
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  },
  {
    id: 'msg_2',
    userId: 'u_vip_1',
    userName: 'Marcus_VFX',
    userBadge: 'vip',
    userColor: '#c084fc',
    text: 'Video stream bitrate is crystal clear at 60fps! 🚀',
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
  {
    id: 'msg_3',
    userId: 'u_sub_1',
    userName: 'Kaito_Dev',
    userBadge: 'sub',
    userColor: '#fbbf24',
    text: 'Audio levels looking super clean on the VU meter.',
    timestamp: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
  },
  {
    id: 'msg_4',
    userId: 'u_sc_1',
    userName: 'David_H',
    userBadge: 'sub',
    userColor: '#fbbf24',
    text: 'Awesome live camera setup! Sending $10 hype! 🔥',
    timestamp: new Date(Date.now() - 1000 * 30).toISOString(),
    isSuperChat: true,
    superChatAmount: 10,
  },
];

// Simulated audience chatter pool
const AUDIENCE_CHAT_POOL = [
  'Stream quality is 10/10 today! 🔥',
  'Loving this camera angle! What lens are you using?',
  'Bitrate is steady at 6000 kbps, zero frame drops on my end.',
  'Let us know what color filter looks best! ✨',
  'Audio is so crisp! Echo cancellation is working nicely.',
  'LFG!! Voted in the poll! 🚀',
  'Greeting from Tokyo! 🇯🇵 Watching the live stream!',
  'The live reaction animations look sick! ❤️',
  'Super clean layout! Great job on the studio setup.',
  'Can you switch to the alpine lake 4K camera for a second?',
];

const BOT_USER_NAMES = [
  { name: 'Chloe_Art', badge: 'sub' as UserBadge, color: '#fbbf24' },
  { name: 'Devin_Code', badge: 'viewer' as UserBadge, color: '#60a5fa' },
  { name: 'Sakura_99', badge: 'vip' as UserBadge, color: '#c084fc' },
  { name: 'Liam_Audio', badge: 'mod' as UserBadge, color: '#34d399' },
  { name: 'Maya_Gamer', badge: 'viewer' as UserBadge, color: '#f472b6' },
];

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('studio');
  const [streamStatus, setStreamStatus] = useState<StreamStatus>('live');
  const [streamTitle, setStreamTitle] = useState<string>('Live Camera Ingest & Real-Time Performance Studio');
  const [streamCategory, setStreamCategory] = useState<string>('IRL Broadcast & Tech Engineering');
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [followerCount, setFollowerCount] = useState<number>(14820);
  const [showLowerThird, setShowLowerThird] = useState<boolean>(true);

  // Modals
  const [isSuperChatOpen, setIsSuperChatOpen] = useState<boolean>(false);
  const [isCreatePollOpen, setIsCreatePollOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // Chat & Community State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [pinnedMessage, setPinnedMessage] = useState<string | null>(
    '🎙️ PulseCast Studio Broadcast is active. Feel free to participate in live polls and test reactions!'
  );
  const [isSimulatingAudience, setIsSimulatingAudience] = useState<boolean>(true);

  // Active Poll
  const [activePoll, setActivePoll] = useState<Poll | null>({
    id: 'poll_initial',
    question: 'How is the live video & audio quality?',
    options: [
      { id: 'opt_1', text: '1080p60 Crystal Clear', votes: 42 },
      { id: 'opt_2', text: 'Smooth, Zero Buffering', votes: 31 },
      { id: 'opt_3', text: 'Audio is Crisp & Clean', votes: 19 },
    ],
    totalVotes: 92,
    endsAt: Date.now() + 1000 * 60 * 5,
    isActive: true,
  });

  // Floating reactions
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);

  // Camera & Audio Engine Hook
  const camera = useLiveCamera();

  // Telemetry Engine Hook
  const telemetry = useStreamTelemetry({
    status: streamStatus,
    resolution: camera.resolution,
    videoRef: camera.videoRef,
    audioPeakDb: camera.audioLevels.peakDb,
    audioRmsDb: camera.audioLevels.rmsDb,
    recentMessages: chatMessages,
  });

  const uptime = telemetry.formatUptime(telemetry.telemetryData.uptimeSeconds);

  // Trigger floating reaction animation
  const triggerReaction = useCallback((emoji: string) => {
    const newReaction: FloatingReaction = {
      id: `react_${Date.now()}_${Math.random()}`,
      emoji,
      x: 15 + Math.random() * 70, // 15% to 85% horizontal position
      size: 26 + Math.floor(Math.random() * 16),
    };

    setReactions((prev) => [...prev, newReaction]);

    // Cleanup after animation completes
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 2500);
  }, []);

  // Send message
  const handleSendMessage = useCallback(
    (text: string, badge: UserBadge, username: string) => {
      const newMsg: ChatMessage = {
        id: `msg_${Date.now()}`,
        userId: `u_${Date.now()}`,
        userName: username,
        userBadge: badge,
        userColor:
          badge === 'broadcaster'
            ? '#fb7185'
            : badge === 'mod'
            ? '#34d399'
            : badge === 'vip'
            ? '#c084fc'
            : badge === 'sub'
            ? '#fbbf24'
            : '#93c5fd',
        text,
        timestamp: new Date().toISOString(),
      };

      setChatMessages((prev) => [...prev, newMsg]);

      // Detect emoji reactions in chat message
      if (text.includes('🔥')) triggerReaction('🔥');
      if (text.includes('❤️')) triggerReaction('❤️');
      if (text.includes('🚀')) triggerReaction('🚀');
      if (text.includes('👏')) triggerReaction('👏');
    },
    [triggerReaction]
  );

  // Handle Super Chat
  const handleSendSuperChat = useCallback(
    (amount: number, text: string) => {
      const superMsg: ChatMessage = {
        id: `sc_${Date.now()}`,
        userId: `u_sc_${Date.now()}`,
        userName: 'You',
        userBadge: 'sub',
        userColor: '#fbbf24',
        text,
        timestamp: new Date().toISOString(),
        isSuperChat: true,
        superChatAmount: amount,
      };

      setChatMessages((prev) => [...prev, superMsg]);
      triggerReaction('🔥');
      triggerReaction('✨');
      triggerReaction('❤️');
    },
    [triggerReaction]
  );

  // Handle Poll Vote
  const handleVotePoll = useCallback((optionId: string) => {
    setActivePoll((prev) => {
      if (!prev || prev.userVotedId) return prev;
      return {
        ...prev,
        userVotedId: optionId,
        totalVotes: prev.totalVotes + 1,
        options: prev.options.map((opt) =>
          opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
        ),
      };
    });
    triggerReaction('📊');
  }, [triggerReaction]);

  // Handle Create New Poll
  const handleCreatePoll = useCallback((newPoll: Poll) => {
    setActivePoll(newPoll);
    setChatMessages((prev) => [
      ...prev,
      {
        id: `sys_poll_${Date.now()}`,
        userId: 'system',
        userName: 'Poll Bot',
        userBadge: 'mod',
        userColor: '#10b981',
        text: `📊 New community poll launched: "${newPoll.question}"! Vote now in chat!`,
        timestamp: new Date().toISOString(),
        isSystem: true,
      },
    ]);
  }, []);

  // Audience Simulation: periodic natural chat activity
  useEffect(() => {
    if (!isSimulatingAudience || streamStatus !== 'live') return;

    const interval = setInterval(() => {
      const randomUser = BOT_USER_NAMES[Math.floor(Math.random() * BOT_USER_NAMES.length)];
      const randomText = AUDIENCE_CHAT_POOL[Math.floor(Math.random() * AUDIENCE_CHAT_POOL.length)];

      const newMsg: ChatMessage = {
        id: `sim_msg_${Date.now()}`,
        userId: `u_sim_${Date.now()}`,
        userName: randomUser.name,
        userBadge: randomUser.badge,
        userColor: randomUser.color,
        text: randomText,
        timestamp: new Date().toISOString(),
      };

      setChatMessages((prev) => {
        const updated = [...prev, newMsg];
        if (updated.length > 120) updated.shift();
        return updated;
      });

      // Occasional reaction
      if (Math.random() > 0.6) {
        const emojis = ['🔥', '❤️', '👏', '🚀', '💯'];
        triggerReaction(emojis[Math.floor(Math.random() * emojis.length)]);
      }

      // Occasional vote in active poll
      if (activePoll && activePoll.isActive && Math.random() > 0.4) {
        const randomOpt = activePoll.options[Math.floor(Math.random() * activePoll.options.length)];
        setActivePoll((p) => {
          if (!p) return null;
          return {
            ...p,
            totalVotes: p.totalVotes + 1,
            options: p.options.map((o) => (o.id === randomOpt.id ? { ...o, votes: o.votes + 1 } : o)),
          };
        });
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isSimulatingAudience, streamStatus, activePoll, triggerReaction]);

  // Go live toggle
  const toggleGoLive = () => {
    setStreamStatus((prev) => (prev === 'live' ? 'offline' : 'live'));
  };

  // Follow toggle
  const toggleFollow = () => {
    setIsFollowing((prev) => {
      setFollowerCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* 3-Zone Top Navigation */}
      <Header
        currentView={currentView}
        onSelectView={setCurrentView}
        streamStatus={streamStatus}
        uptime={uptime}
        onToggleGoLive={toggleGoLive}
      />

      {/* Camera Error / Permission Notice */}
      {camera.error && (
        <div className="bg-amber-950/60 border-b border-amber-800/80 px-6 py-2.5 text-xs text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{camera.error}</span>
          </div>
          <button
            onClick={camera.retryCamera}
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-900/60 hover:bg-amber-900 text-amber-100 rounded text-xs font-medium transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Camera</span>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 md:p-6 flex flex-col">
        {/* VIEW 1: BROADCAST STUDIO */}
        {currentView === 'studio' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Columns: Main Video Canvas & Broadcaster Controls */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {/* Video Player */}
              <VideoPlayer
                videoRef={camera.videoRef}
                streamStatus={streamStatus}
                streamTitle={streamTitle}
                streamerName="Sarah Jenkins"
                filter={camera.filter}
                isMirrored={camera.isMirrored}
                isVideoMuted={camera.isVideoMuted}
                isRecording={camera.isRecording}
                recordingSeconds={camera.recordingSeconds}
                viewers={telemetry.currentViewers}
                fps={telemetry.telemetryData.fps}
                resolution={telemetry.telemetryData.resolution}
                uptime={uptime}
                reactions={reactions}
                showLowerThird={showLowerThird}
                onTakeSnapshot={camera.takeSnapshot}
                onToggleRecording={camera.isRecording ? camera.stopRecording : camera.startRecording}
              />

              {/* Hardware Video & Audio Controls */}
              <StreamControls
                source={camera.source}
                filter={camera.filter}
                resolution={camera.resolution}
                status={streamStatus}
                isAudioMuted={camera.isAudioMuted}
                isVideoMuted={camera.isVideoMuted}
                isMirrored={camera.isMirrored}
                cameraDevices={camera.cameraDevices}
                activeCameraId={camera.activeCameraId}
                showLowerThird={showLowerThird}
                onSetSource={camera.setSource}
                onSetFilter={camera.setFilter}
                onSetResolution={camera.setResolution}
                onToggleAudio={camera.toggleAudio}
                onToggleVideo={camera.toggleVideo}
                onToggleMirror={camera.toggleMirror}
                onSetActiveCameraId={camera.setActiveCameraId}
                onToggleLowerThird={() => setShowLowerThird((p) => !p)}
                onToggleGoLive={toggleGoLive}
              />

              {/* Audio VU Meter & Quick Stream Information */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-6">
                  <AudioVuMeter
                    levels={camera.audioLevels}
                    isMuted={camera.isAudioMuted}
                    onToggleMute={camera.toggleAudio}
                  />
                </div>

                <div className="md:col-span-6 flex items-center justify-between p-3 bg-neutral-900/90 border border-neutral-800 rounded-lg text-xs">
                  <div className="flex items-center gap-2">
                    <img
                      src={STREAMER_AVATAR}
                      alt="Streamer"
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover border border-neutral-700"
                    />
                    <div className="truncate">
                      <div className="font-semibold text-white truncate">Sarah Jenkins</div>
                      <div className="text-[11px] text-neutral-400 truncate">{streamCategory}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setIsShareModalOpen(true)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg transition-colors font-medium"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Studio Telemetry Mini-Strip */}
              <div className="p-4 bg-neutral-900/80 border border-neutral-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>Live Studio Telemetry</span>
                  </div>
                  <button
                    onClick={() => setCurrentView('analytics')}
                    className="text-rose-400 hover:text-rose-300 font-medium hover:underline text-xs"
                  >
                    View Full Analytics →
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-2.5 bg-neutral-950 rounded-lg border border-neutral-800/80">
                    <div className="text-[10px] text-neutral-500 uppercase">Bitrate</div>
                    <div className="text-base font-bold text-white tabular-nums mt-0.5">
                      {telemetry.telemetryData.bitrateKbps.toLocaleString()}{' '}
                      <span className="text-xs font-normal text-neutral-400">kbps</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-neutral-950 rounded-lg border border-neutral-800/80">
                    <div className="text-[10px] text-neutral-500 uppercase">FPS</div>
                    <div className="text-base font-bold text-emerald-400 tabular-nums mt-0.5">
                      {telemetry.telemetryData.fps}
                    </div>
                  </div>

                  <div className="p-2.5 bg-neutral-950 rounded-lg border border-neutral-800/80">
                    <div className="text-[10px] text-neutral-500 uppercase">Peak Viewers</div>
                    <div className="text-base font-bold text-white tabular-nums mt-0.5">
                      {telemetry.peakViewers.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-2.5 bg-neutral-950 rounded-lg border border-neutral-800/80">
                    <div className="text-[10px] text-neutral-500 uppercase">Health</div>
                    <div className="text-base font-bold text-emerald-400 uppercase mt-0.5">
                      {telemetry.telemetryData.health}
                    </div>
                  </div>
                </div>

                {/* Compact Rolling Telemetry Preview */}
                <BitrateViewerChart data={telemetry.history} metric="both" height={130} />
              </div>
            </div>

            {/* Right 4 Columns: Interactive Live Chat & Community Module */}
            <div className="lg:col-span-4 h-[780px] flex flex-col">
              <LiveChat
                messages={chatMessages}
                activePoll={activePoll}
                pinnedMessage={pinnedMessage}
                onSendMessage={handleSendMessage}
                onVotePoll={handleVotePoll}
                onTriggerReaction={triggerReaction}
                onOpenSuperChat={() => setIsSuperChatOpen(true)}
                onOpenCreatePoll={() => setIsCreatePollOpen(true)}
                onClearChat={() => setChatMessages([])}
                onDismissPinned={() => setPinnedMessage(null)}
                isSimulatingAudience={isSimulatingAudience}
                onToggleAudienceSimulation={() => setIsSimulatingAudience((p) => !p)}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: THEATER VIEW (Cinematic Viewer Experience) */}
        {currentView === 'theater' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 flex flex-col gap-4">
              <VideoPlayer
                videoRef={camera.videoRef}
                streamStatus={streamStatus}
                streamTitle={streamTitle}
                streamerName="Sarah Jenkins"
                filter={camera.filter}
                isMirrored={camera.isMirrored}
                isVideoMuted={camera.isVideoMuted}
                isRecording={camera.isRecording}
                recordingSeconds={camera.recordingSeconds}
                viewers={telemetry.currentViewers}
                fps={telemetry.telemetryData.fps}
                resolution={telemetry.telemetryData.resolution}
                uptime={uptime}
                reactions={reactions}
                showLowerThird={showLowerThird}
                onTakeSnapshot={camera.takeSnapshot}
                onToggleRecording={camera.isRecording ? camera.stopRecording : camera.startRecording}
              />

              {/* Streamer Profile Card in Theater Mode */}
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={STREAMER_AVATAR}
                    alt="Streamer"
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover border-2 border-rose-500 shadow-md"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">Sarah Jenkins</h3>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        VERIFIED PARTNER
                      </span>
                    </div>

                    <p className="text-xs text-neutral-400 mt-0.5 font-mono">
                      {followerCount.toLocaleString()} followers · {streamCategory}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleFollow}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md ${
                      isFollowing
                        ? 'bg-neutral-800 text-neutral-200 border border-neutral-700'
                        : 'bg-rose-600 hover:bg-rose-500 text-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFollowing ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{isFollowing ? 'Following' : 'Follow'}</span>
                  </button>

                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stream Title Editor / Display */}
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
                {isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={streamTitle}
                      onChange={(e) => setStreamTitle(e.target.value)}
                      className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                    />
                    <button
                      onClick={() => setIsEditingTitle(false)}
                      className="p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h1 className="text-lg font-bold text-white">{streamTitle}</h1>
                      <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1 font-mono">
                        <span>Started {uptime} ago</span>
                        <span aria-hidden="true">·</span>
                        <span>{telemetry.telemetryData.resolution}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-400">{telemetry.telemetryData.fps} FPS</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsEditingTitle(true)}
                      className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors shrink-0"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Sidebar */}
            <div className="lg:col-span-4 h-[750px] flex flex-col">
              <LiveChat
                messages={chatMessages}
                activePoll={activePoll}
                pinnedMessage={pinnedMessage}
                onSendMessage={handleSendMessage}
                onVotePoll={handleVotePoll}
                onTriggerReaction={triggerReaction}
                onOpenSuperChat={() => setIsSuperChatOpen(true)}
                onOpenCreatePoll={() => setIsCreatePollOpen(true)}
                onClearChat={() => setChatMessages([])}
                onDismissPinned={() => setPinnedMessage(null)}
                isSimulatingAudience={isSimulatingAudience}
                onToggleAudienceSimulation={() => setIsSimulatingAudience((p) => !p)}
              />
            </div>
          </div>
        )}

        {/* VIEW 3: MULTI-CHANNEL BROWSER */}
        {currentView === 'channels' && (
          <ChannelBrowser
            currentSource={camera.source}
            onSelectChannel={(src) => {
              camera.setSource(src);
              setCurrentView('studio');
            }}
            userStreamerAvatar={STREAMER_AVATAR}
          />
        )}

        {/* VIEW 4: REAL-TIME ANALYTICS DASHBOARD */}
        {currentView === 'analytics' && (
          <AnalyticsDashboard
            telemetry={telemetry.telemetryData}
            history={telemetry.history}
            currentViewers={telemetry.currentViewers}
            peakViewers={telemetry.peakViewers}
            totalUniqueViewers={telemetry.totalUniqueViewers}
            chatVelocity={telemetry.chatVelocity}
            chatSentiment={telemetry.chatSentiment}
            geoStats={telemetry.geoStats}
            uptime={uptime}
            onExportReport={telemetry.exportAnalyticsReport}
          />
        )}
      </main>

      {/* Super Chat Modal */}
      <SuperChatModal
        isOpen={isSuperChatOpen}
        onClose={() => setIsSuperChatOpen(false)}
        onSendSuperChat={handleSendSuperChat}
      />

      {/* Create Poll Modal */}
      <CreatePollModal
        isOpen={isCreatePollOpen}
        onClose={() => setIsCreatePollOpen(false)}
        onCreatePoll={handleCreatePoll}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        streamTitle={streamTitle}
      />
    </div>
  );
}
