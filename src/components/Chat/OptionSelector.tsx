import { useState } from 'react';
import type { QuestionOption } from '../../types/requirement';

interface Props {
  options: QuestionOption[];
  multiSelect?: boolean;
  allowFreeInput?: boolean;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export function OptionSelector({ options, multiSelect, allowFreeInput, onSelect, disabled }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [freeInput, setFreeInput] = useState('');

  if (disabled) return null;

  const handleClick = (value: string) => {
    if (multiSelect) {
      const next = new Set(selected);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      setSelected(next);
    } else {
      onSelect(value);
    }
  };

  const handleSubmitMulti = () => {
    const values = [...selected];
    if (freeInput.trim()) {
      values.push(freeInput.trim());
    }
    if (values.length > 0) {
      onSelect(values.join(','));
    }
  };

  return (
    <div className="mb-3 flex flex-col gap-2">
      <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2 ${options.length > 12 ? 'max-h-[300px] overflow-y-auto pr-1' : ''}`}>
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleClick(opt.value)}
            className={`rounded-md px-3 py-2.5 text-[13px] font-medium transition-all border text-left ${
              selected.has(opt.value)
                ? 'bg-[#00b4ed] text-white border-[#00b4ed] shadow-md'
                : 'bg-white text-[#313131] border-[#d8dde5] hover:border-[#00b4ed] hover:bg-[#f0f9fd]'
            }`}
          >
            {opt.label}
            {opt.description && (
              <span className={`block text-[11px] mt-0.5 ${selected.has(opt.value) ? 'text-white/70' : 'text-[#8b95a5]'}`}>{opt.description}</span>
            )}
          </button>
        ))}
      </div>
      {allowFreeInput && (
        <div className="flex gap-2 mt-1">
          <input
            type="text"
            value={freeInput}
            onChange={(e) => setFreeInput(e.target.value)}
            placeholder="その他（自由入力）"
            className="flex-1 rounded-md border border-[#d8dde5] px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#00b4ed]/40 focus:border-[#00b4ed]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !multiSelect && freeInput.trim()) {
                onSelect(freeInput.trim());
              }
            }}
          />
        </div>
      )}
      {multiSelect && (
        <button
          onClick={handleSubmitMulti}
          disabled={selected.size === 0 && !freeInput.trim()}
          className="self-end rounded-md bg-[#00b4ed] text-white px-5 py-2 text-[13px] font-medium hover:bg-[#0090d9] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          決定
        </button>
      )}
    </div>
  );
}
