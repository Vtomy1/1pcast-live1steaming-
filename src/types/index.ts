export type StreamSource = 'webcam' | 'screen' | 'wildlife' | 'studio' | 'testpattern';
export type StreamFilter = 'none' | 'studio' | 'cyber' | 'noir' | 'vivid' | 'vintage';
export type StreamResolution = '1080p60' | '720p60' | '480p30';
export type StreamStatus = 'offline' | 'connecting' | 'live' | 'ending';
export type AppView = 'studio' | 'theater' | 'channels' | 'analytics';

export type UserBadge = 'broadcaster' | 'mod' | 'vip' | 'sub' | 'viewer';

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userBadge: UserBadge;
  userColor: string;
  text: string;
  timestamp: string;
  isSuperChat?: boolean;
  superChatAmount?: number;
  isPinned?: boolean;
  isSystem?: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  userVotedId?: string;
  endsAt: number; // timestamp
  isActive: boolean;
}

export interface FloatingReaction {
  id: string;
  emoji: string;
  x: number; // 10 to 90 %
  size: number; // px
}

export interface TelemetryData {
  fps: number;
  bitrateKbps: number;
  dropFrameRate: number; // %
  jitterMs: number;
  resolution: string;
  audioPeakDb: number; // -60 to 0
  audioRmsDb: number;
  health: 'excellent' | 'good' | 'fair' | 'poor';
  uptimeSeconds: number;
}

export interface AnalyticsHistoryPoint {
  timestamp: string;
  timeLabel: string;
  viewers: number;
  bitrate: number;
  fps: number;
  chatVelocity: number;
}

export interface GeoViewerStat {
  country: string;
  flag: string;
  percentage: number;
  count: number;
}

export interface StreamChannel {
  id: string;
  title: string;
  streamerName: string;
  streamerAvatar: string;
  category: string;
  source: StreamSource;
  thumbnailUrl: string;
  viewers: number;
  isLive: boolean;
  tags: string[];
}
