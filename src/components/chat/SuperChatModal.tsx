import React, { useState } from 'react';
import { X, Heart, Sparkles, DollarSign } from 'lucide-react';

interface SuperChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendSuperChat: (amount: number, text: string) => void;
}

const TIER_OPTIONS = [
  { amount: 2, label: '$2.00', bg: 'bg-cyan-600', text: 'text-white' },
  { amount: 5, label: '$5.00', bg: 'bg-emerald-600', text: 'text-white' },
  { amount: 10, label: '$10.00', bg: 'bg-amber-500', text: 'text-neutral-950 font-bold' },
  { amount: 25, label: '$25.00', bg: 'bg-orange-600', text: 'text-white font-bold' },
  { amount: 50, label: '$50.00', bg: 'bg-rose-600', text: 'text-white font-bold' },
  { amount: 100, label: '$100.00', bg: 'bg-purple-600', text: 'text-white font-bold' },
];

export const SuperChatModal: React.FC<SuperChatModalProps> = ({
  isOpen,
  onClose,
  onSendSuperChat,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(5);
  const [customText, setCustomText] = useState<string>('Love the high-quality stream! Keep it up! 🔥');

  if (!isOpen) return null;

  const currentTier = TIER_OPTIONS.find((t) => t.amount === selectedAmount) || TIER_OPTIONS[1];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    onSendSuperChat(selectedAmount, customText.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Send Super Chat & Cheer</h3>
              <p className="text-xs text-neutral-400">Highlight your message at the top of live chat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Amount Tiers */}
          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-2">Select Donation Amount</label>
            <div className="grid grid-cols-3 gap-2">
              {TIER_OPTIONS.map((tier) => (
                <button
                  key={tier.amount}
                  type="button"
                  onClick={() => setSelectedAmount(tier.amount)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border ${
                    selectedAmount === tier.amount
                      ? `${tier.bg} ${tier.text} border-transparent shadow-lg scale-[1.02]`
                      : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview Card */}
          <div>
            <label className="text-xs font-medium text-neutral-400 block mb-1.5">Chat Preview</label>
            <div className="rounded-xl overflow-hidden border border-neutral-700/60 shadow-md">
              <div className={`px-4 py-2 flex items-center justify-between ${currentTier.bg} ${currentTier.text}`}>
                <span className="text-xs font-bold">You (Super Chat)</span>
                <span className="text-xs font-mono font-bold">${selectedAmount}.00</span>
              </div>
              <div className="bg-neutral-950 p-3 text-xs text-neutral-200 min-h-[48px]">
                {customText || <span className="text-neutral-500 italic">Enter your message below...</span>}
              </div>
            </div>
          </div>

          {/* Custom message input */}
          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1.5">Your Message</label>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              maxLength={200}
              rows={2}
              placeholder="Cheer on the streamer..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-rose-500 resize-none"
            />
            <div className="text-right text-[10px] text-neutral-500 mt-1 font-mono">
              {customText.length}/200
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!customText.trim()}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 transition-all shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Send ${selectedAmount}.00 Super Chat</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
