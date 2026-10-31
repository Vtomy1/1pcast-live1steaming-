import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Smile,
  Shield,
  Star,
  DollarSign,
  BarChart2,
  Settings2,
  Trash2,
  ArrowDown,
  User,
  Radio,
  Flame,
  CheckCircle,
  Pause,
  Play,
  Pin,
  Clock,
} from 'lucide-react';
import { ChatMessage, Poll, UserBadge } from '../../types';

interface LiveChatProps {
  messages: ChatMessage[];
  activePoll: Poll | null;
  pinnedMessage: string | null;
  onSendMessage: (text: string, badge: UserBadge, username: string) => void;
  onVotePoll: (optionId: string) => void;
  onTriggerReaction: (emoji: string) => void;
  onOpenSuperChat: () => void;
  onOpenCreatePoll: () => void;
  onClearChat: () => void;
  onDismissPinned: () => void;
  isSimulatingAudience: boolean;
  onToggleAudienceSimulation: () => void;
}

const BADGE_STYLES: Record<UserBadge, { label: string; bg: string; text: string }> = {
  broadcaster: { label: 'BROADCASTER', bg: 'bg-rose-500/20 border-rose-500/40', text: 'text-rose-400' },
  mod: { label: 'MOD', bg: 'bg-emerald-500/20 border-emerald-500/40', text: 'text-emerald-400' },
  vip: { label: 'VIP', bg: 'bg-purple-500/20 border-purple-500/40', text: 'text-purple-400' },
  sub: { label: 'SUB', bg: 'bg-amber-500/20 border-amber-500/40', text: 'text-amber-400' },
  viewer: { label: '', bg: '', text: 'text-neutral-400' },
};

const QUICK_EMOJIS = ['🔥', '❤️', '👏', '🚀', '💯', '✨'];

export const LiveChat: React.FC<LiveChatProps> = ({
  messages,
  activePoll,
  pinnedMessage,
  onSendMessage,
  onVotePoll,
  onTriggerReaction,
  onOpenSuperChat,
  onOpenCreatePoll,
  onClearChat,
  onDismissPinned,
  isSimulatingAudience,
  onToggleAudienceSimulation,
}) => {
  const [inputText, setInputText] = useState('');
  const [userName, setUserName] = useState('Alex_Dev');
  const [userBadge, setUserBadge] = useState<UserBadge>('viewer');
  const [showIdentitySettings, setShowIdentitySettings] = useState(false);
  const [showModSettings, setShowModSettings] = useState(false);
  const [isSlowMode, setIsSlowMode] = useState(false);
  const [slowModeCooldown, setSlowModeCooldown] = useState(0);
  const [isScrolledUp, setIsScrolledUp] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Handle scroll detection
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    setIsScrolledUp(!isAtBottom);
  };

  const scrollToBottom = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    setIsScrolledUp(false);
  };

  // Auto scroll on new messages if near bottom
  useEffect(() => {
    if (!isScrolledUp) {
      const el = scrollContainerRef.current;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }
  }, [messages, isScrolledUp]);

  // Handle slow mode timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (slowModeCooldown > 0) {
      timer = setInterval(() => {
        setSlowModeCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [slowModeCooldown]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || slowModeCooldown > 0) return;

    onSendMessage(inputText.trim(), userBadge, userName.trim() || 'Anonymous');
    setInputText('');

    if (isSlowMode && userBadge === 'viewer') {
      setSlowModeCooldown(5);
    }

    scrollToBottom();
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-neutral-800 bg-neutral-950/60">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-200">Stream Chat</span>
          <span className="text-[11px] text-neutral-500 font-mono tabular-nums">({messages.length})</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Create Poll Trigger */}
          <button
            onClick={onOpenCreatePoll}
            title="Create live poll"
            className="p-1.5 text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <BarChart2 className="w-4 h-4" />
          </button>

          {/* User Identity Setup */}
          <button
            onClick={() => setShowIdentitySettings((prev) => !prev)}
            title="Change your chat handle or badge"
            className={`p-1.5 rounded-lg transition-colors ${
              showIdentitySettings ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <User className="w-4 h-4" />
          </button>

          {/* Moderation panel */}
          <button
            onClick={() => setShowModSettings((prev) => !prev)}
            title="Chat moderation controls"
            className={`p-1.5 rounded-lg transition-colors ${
              showModSettings ? 'bg-neutral-800 text-rose-400' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Shield className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Identity Drawer */}
      {showIdentitySettings && (
        <div className="p-3 bg-neutral-950 border-b border-neutral-800 text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-neutral-300">Your Chat Persona</span>
            <button
              onClick={() => setShowIdentitySettings(false)}
              className="text-[10px] text-neutral-500 hover:text-neutral-300"
            >
              Done
            </button>
          </div>
          <div>
            <label className="text-[10px] text-neutral-400 block mb-1">Display Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-rose-500"
              maxLength={24}
            />
          </div>
          <div>
            <label className="text-[10px] text-neutral-400 block mb-1">Badge Role</label>
            <div className="grid grid-cols-4 gap-1">
              {(['viewer', 'sub', 'vip', 'mod'] as UserBadge[]).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setUserBadge(b)}
                  className={`py-1 text-[10px] rounded uppercase font-semibold transition-colors border ${
                    userBadge === b
                      ? 'bg-rose-500 text-white border-transparent'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Moderation Drawer */}
      {showModSettings && (
        <div className="p-3 bg-neutral-950 border-b border-neutral-800 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-rose-400 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Moderation Studio</span>
            </span>
            <button
              onClick={() => setShowModSettings(false)}
              className="text-[10px] text-neutral-500 hover:text-neutral-300"
            >
              Close
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-neutral-300">Audience Simulation</span>
            <button
              onClick={onToggleAudienceSimulation}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                isSimulatingAudience
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {isSimulatingAudience ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              <span>{isSimulatingAudience ? 'Active' : 'Paused'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-neutral-300">5s Slow Mode</span>
            <button
              onClick={() => setIsSlowMode((prev) => !prev)}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                isSlowMode ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {isSlowMode ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <div className="pt-1">
            <button
              onClick={onClearChat}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-neutral-900 hover:bg-rose-950/40 text-neutral-400 hover:text-rose-400 border border-neutral-800 hover:border-rose-900/50 rounded transition-colors text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Chat History</span>
            </button>
          </div>
        </div>
      )}

      {/* Pinned announcement banner */}
      {pinnedMessage && (
        <div className="flex items-start justify-between gap-2 px-3 py-2 bg-neutral-800/80 border-b border-neutral-700/60 text-xs">
          <div className="flex items-start gap-1.5">
            <Pin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-neutral-200 line-clamp-2">{pinnedMessage}</p>
          </div>
          <button
            onClick={onDismissPinned}
            title="Dismiss pinned message"
            className="text-neutral-400 hover:text-white p-0.5"
          >
            ×
          </button>
        </div>
      )}

      {/* Active Community Poll banner */}
      {activePoll && activePoll.isActive && (
        <div className="p-3 bg-neutral-950 border-b border-neutral-800 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <BarChart2 className="w-4 h-4" />
              <span>Live Community Poll</span>
            </div>
            <div className="text-[10px] text-neutral-400 font-mono tabular-nums">
              {activePoll.totalVotes} votes
            </div>
          </div>

          <div className="font-medium text-white text-xs">{activePoll.question}</div>

          <div className="space-y-1.5 pt-1">
            {activePoll.options.map((opt) => {
              const pct = activePoll.totalVotes > 0 ? Math.round((opt.votes / activePoll.totalVotes) * 100) : 0;
              const isSelected = activePoll.userVotedId === opt.id;

              return (
                <button
                  key={opt.id}
                  onClick={() => onVotePoll(opt.id)}
                  disabled={!!activePoll.userVotedId}
                  className={`w-full relative overflow-hidden rounded-lg p-2 text-left text-xs transition-all border ${
                    isSelected
                      ? 'border-emerald-500 bg-neutral-900'
                      : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700'
                  }`}
                >
                  {/* Progress bar background */}
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-emerald-500/20 transition-all duration-300 pointer-events-none"
                    style={{ width: `${pct}%` }}
                  />

                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      {isSelected && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                      <span className={isSelected ? 'text-white font-medium' : 'text-neutral-300'}>{opt.text}</span>
                    </div>
                    <span className="font-mono text-[11px] text-neutral-400 tabular-nums ml-2 shrink-0">{pct}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs select-text"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500 p-4">
            <Radio className="w-8 h-8 mb-2 opacity-40 text-neutral-400" />
            <p className="text-xs">No chat messages yet.</p>
            <p className="text-[11px] text-neutral-600">Say hello or launch a poll to start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.isSuperChat) {
              return (
                <div
                  key={msg.id}
                  className="rounded-xl overflow-hidden border border-amber-500/40 bg-neutral-950 shadow-lg"
                >
                  <div className="flex items-center justify-between px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 text-neutral-950 font-bold">
                    <span className="text-xs">{msg.userName}</span>
                    <span className="text-xs font-mono font-bold">${msg.superChatAmount}.00</span>
                  </div>
                  <div className="p-2.5 text-neutral-100 text-xs font-medium">{msg.text}</div>
                </div>
              );
            }

            const badgeConfig = BADGE_STYLES[msg.userBadge];

            return (
              <div key={msg.id} className="group flex items-start gap-1.5 leading-relaxed break-words hover:bg-neutral-800/30 p-1 rounded transition-colors">
                {/* Timestamp */}
                <span className="text-[10px] text-neutral-600 font-mono shrink-0 pt-0.5 tabular-nums">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                {/* Badge if present */}
                {msg.userBadge !== 'viewer' && badgeConfig.label && (
                  <span
                    className={`inline-block px-1.5 py-0.2 text-[9px] font-bold rounded uppercase tracking-wider border ${badgeConfig.bg} ${badgeConfig.text} shrink-0`}
                  >
                    {badgeConfig.label}
                  </span>
                )}

                {/* Sender Name */}
                <span className="font-semibold text-neutral-200 shrink-0 hover:underline cursor-pointer" style={{ color: msg.userColor }}>
                  {msg.userName}:
                </span>

                {/* Text Content */}
                <span className="text-neutral-300 selection:bg-rose-500/30 selection:text-white">
                  {msg.text}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Jump to bottom indicator */}
      {isScrolledUp && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 bg-rose-600 text-white text-xs font-semibold rounded-full shadow-lg hover:bg-rose-500 transition-colors z-20 animate-bounce"
        >
          <ArrowDown className="w-3.5 h-3.5" />
          <span>New messages</span>
        </button>
      )}

      {/* Quick reaction particles bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-950/80 border-t border-neutral-800">
        <div className="flex items-center gap-1.5">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onTriggerReaction(emoji)}
              title={`Send ${emoji} reaction`}
              className="p-1 hover:scale-125 transition-transform text-sm"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Super Chat Cheer Trigger */}
        <button
          onClick={onOpenSuperChat}
          className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-full transition-colors"
        >
          <DollarSign className="w-3 h-3" />
          <span>Cheer</span>
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-2.5 bg-neutral-950 border-t border-neutral-800">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={slowModeCooldown > 0}
            placeholder={
              slowModeCooldown > 0
                ? `Slow mode: wait ${slowModeCooldown}s...`
                : 'Send a live message...'
            }
            className="flex-1 bg-neutral-900 border border-neutral-800 focus:border-rose-500 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors"
            maxLength={280}
          />

          <button
            type="submit"
            disabled={!inputText.trim() || slowModeCooldown > 0}
            className="p-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-40 disabled:hover:bg-rose-600 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
