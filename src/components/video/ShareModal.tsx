import React, { useState } from 'react';
import { X, Copy, Check, Radio, Share2, Key } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  streamTitle: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  streamTitle,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  if (!isOpen) return null;

  const streamUrl = window.location.href;
  const simulatedStreamKey = 'live_pk_8471928472910482_pulse';

  const copyLink = () => {
    navigator.clipboard.writeText(streamUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyKey = () => {
    navigator.clipboard.writeText(simulatedStreamKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Share Live Stream</h3>
              <p className="text-xs text-neutral-400">{streamTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="text-neutral-300 font-medium block mb-1.5">Stream Watch Link</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={streamUrl}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-300 font-mono text-[11px] focus:outline-none"
              />
              <button
                onClick={copyLink}
                className="flex items-center gap-1 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-medium transition-colors"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-neutral-300 font-medium block mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>RTMP Ingest Key (for OBS / vMix / Wirecast)</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="password"
                readOnly
                value={simulatedStreamKey}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-300 font-mono text-[11px] focus:outline-none"
              />
              <button
                onClick={copyKey}
                className="flex items-center gap-1 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-medium transition-colors"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-[10px] text-neutral-500 mt-1">RTMP URL: rtmp://live.pulsecast.io/app</p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
