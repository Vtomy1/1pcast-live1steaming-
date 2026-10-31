import React from 'react';
import {
  Activity,
  Users,
  Radio,
  Clock,
  Download,
  Zap,
  Globe,
  MessageSquare,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  TelemetryData,
  AnalyticsHistoryPoint,
  GeoViewerStat,
} from '../../types';
import { BitrateViewerChart } from './BitrateViewerChart';

interface AnalyticsDashboardProps {
  telemetry: TelemetryData;
  history: AnalyticsHistoryPoint[];
  currentViewers: number;
  peakViewers: number;
  totalUniqueViewers: number;
  chatVelocity: number;
  chatSentiment: { positive: number; neutral: number; hype: number };
  geoStats: GeoViewerStat[];
  uptime: string;
  onExportReport: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  telemetry,
  history,
  currentViewers,
  peakViewers,
  totalUniqueViewers,
  chatVelocity,
  chatSentiment,
  geoStats,
  uptime,
  onExportReport,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Header & Export */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Stream Telemetry & Analytics</h2>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1 font-mono">
            <span>Uptime: {uptime}</span>
            <span aria-hidden="true">·</span>
            <span>Ingest: WebRTC / Canvas Ingest</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-semibold uppercase">{telemetry.health} HEALTH</span>
          </div>
        </div>

        <button
          onClick={onExportReport}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700 rounded-lg text-xs font-medium transition-colors"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export Telemetry JSON</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Concurrent Viewers */}
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span>Live Viewers</span>
            <Users className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white">
            {currentViewers.toLocaleString()}
          </div>
          <div className="text-[11px] text-neutral-500 font-mono mt-1">
            Peak: {peakViewers.toLocaleString()} viewers
          </div>
        </div>

        {/* Real-time Bitrate */}
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span>Bitrate</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white">
            {telemetry.bitrateKbps.toLocaleString()} <span className="text-xs text-neutral-400 font-sans font-normal">kbps</span>
          </div>
          <div className="text-[11px] text-neutral-500 font-mono mt-1">
            Nominal: {telemetry.resolution}
          </div>
        </div>

        {/* Video FPS */}
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span>Frame Rate</span>
            <Radio className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white">
            {telemetry.fps} <span className="text-xs text-neutral-400 font-sans font-normal">FPS</span>
          </div>
          <div className="text-[11px] text-neutral-500 font-mono mt-1">
            Drops: {telemetry.dropFrameRate}% · Jitter: {telemetry.jitterMs}ms
          </div>
        </div>

        {/* Chat Velocity */}
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span>Chat Velocity</span>
            <MessageSquare className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white">
            {chatVelocity} <span className="text-xs text-neutral-400 font-sans font-normal">msg/min</span>
          </div>
          <div className="text-[11px] text-neutral-500 font-mono mt-1">
            Total unique: {totalUniqueViewers.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Real-time Rolling Chart */}
      <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Real-Time Performance Stream</h3>
          <span className="text-xs text-neutral-400 font-mono">Live Ingest Synchronization</span>
        </div>
        <BitrateViewerChart data={history} metric="both" height={220} />
      </div>

      {/* Two Column Grid: Audience Engagement & Technical Ingest Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement & Sentiment Breakdown */}
        <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-semibold text-white">Chat Sentiment & Vibe</h3>
            <span className="text-xs text-neutral-400 font-mono">Real-time analysis</span>
          </div>

          {/* Sentiment Bar */}
          <div className="space-y-2">
            <div className="h-3 w-full bg-neutral-950 rounded-full overflow-hidden flex">
              <div
                className="bg-rose-500 transition-all duration-300"
                style={{ width: `${chatSentiment.hype}%` }}
                title={`Hype: ${chatSentiment.hype}%`}
              />
              <div
                className="bg-emerald-500 transition-all duration-300"
                style={{ width: `${chatSentiment.positive}%` }}
                title={`Positive: ${chatSentiment.positive}%`}
              />
              <div
                className="bg-neutral-600 transition-all duration-300"
                style={{ width: `${chatSentiment.neutral}%` }}
                title={`Neutral: ${chatSentiment.neutral}%`}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono pt-1">
              <div className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Hype {chatSentiment.hype}%</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Positive {chatSentiment.positive}%</span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-400">
                <span className="w-2 h-2 rounded-full bg-neutral-600" />
                <span>Neutral {chatSentiment.neutral}%</span>
              </div>
            </div>
          </div>

          {/* Geographic Viewer Table */}
          <div className="pt-2">
            <div className="text-xs font-semibold text-neutral-300 mb-2 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Audience Geographic Distribution</span>
            </div>

            <div className="space-y-2">
              {geoStats.map((geo) => (
                <div key={geo.country} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-[140px]">
                    <span>{geo.flag}</span>
                    <span className="text-neutral-300">{geo.country}</span>
                  </div>

                  <div className="flex-1 mx-3 h-1.5 bg-neutral-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500/80 rounded-full"
                      style={{ width: `${geo.percentage}%` }}
                    />
                  </div>

                  <span className="text-neutral-400 font-mono tabular-nums min-w-[45px] text-right">
                    {geo.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Technical Audio/Video Ingest Specs */}
        <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-semibold text-white">Broadcast Ingest Specifications</h3>
            <span className="text-xs text-emerald-400 font-mono uppercase">Online</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between py-1.5 border-b border-neutral-800/60">
              <span className="text-neutral-400">Video Encoder</span>
              <span className="text-white">WebRTC / NVENC H.264 / VP8</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-neutral-800/60">
              <span className="text-neutral-400">Target Resolution</span>
              <span className="text-white">{telemetry.resolution}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-neutral-800/60">
              <span className="text-neutral-400">Keyframe Interval (GOP)</span>
              <span className="text-white">2.00 seconds (120 frames)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-neutral-800/60">
              <span className="text-neutral-400">Audio Codec & Sample Rate</span>
              <span className="text-white">Opus 48.0 kHz Stereo (160 kbps)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-neutral-800/60">
              <span className="text-neutral-400">Audio Peak dBFS</span>
              <span className="text-white tabular-nums">{telemetry.audioPeakDb.toFixed(1)} dB</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-neutral-400">Network Packet Jitter</span>
              <span className="text-emerald-400 tabular-nums">{telemetry.jitterMs} ms (Nominal)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
