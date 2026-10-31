import React, { useState } from 'react';
import { X, Plus, Trash2, BarChart2 } from 'lucide-react';
import { Poll } from '../../types';

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePoll: (poll: Poll) => void;
}

export const CreatePollModal: React.FC<CreatePollModalProps> = ({
  isOpen,
  onClose,
  onCreatePoll,
}) => {
  const [question, setQuestion] = useState<string>('What should we feature next on stream?');
  const [options, setOptions] = useState<string[]>([
    'Camera Filter: Cyber Teal',
    'Switch to Alpine 4K Feed',
    'Audio Level & Mic Test',
  ]);
  const [durationMinutes, setDurationMinutes] = useState<number>(3);

  if (!isOpen) return null;

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, `Option ${options.length + 1}`]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const validOptions = options
      .map((opt, i) => ({ id: `opt_${Date.now()}_${i}`, text: opt.trim(), votes: 0 }))
      .filter((opt) => opt.text.length > 0);

    if (validOptions.length < 2) return;

    const newPoll: Poll = {
      id: `poll_${Date.now()}`,
      question: question.trim(),
      options: validOptions,
      totalVotes: 0,
      endsAt: Date.now() + durationMinutes * 60 * 1000,
      isActive: true,
    };

    onCreatePoll(newPoll);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Create Community Poll</h3>
              <p className="text-xs text-neutral-400">Engage your live stream viewers in real time</p>
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
          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1.5">Poll Question</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask your audience a question..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-emerald-500"
              maxLength={100}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1.5">Poll Options (2 - 5)</label>
            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 5 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="mt-2 flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Option</span>
              </button>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1.5">Poll Duration</label>
            <div className="flex gap-2">
              {[1, 3, 5, 10].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDurationMinutes(mins)}
                  className={`flex-1 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                    durationMinutes === mins
                      ? 'bg-emerald-600 text-white border-transparent'
                      : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

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
              disabled={!question.trim() || options.filter((o) => o.trim()).length < 2}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-all shadow-md"
            >
              Launch Live Poll
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
