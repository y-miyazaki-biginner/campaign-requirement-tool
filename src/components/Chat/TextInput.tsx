import { useState } from 'react';

interface Props {
  onSubmit: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function TextInput({ onSubmit, placeholder = 'メッセージを入力...', disabled }: Props) {
  const [value, setValue] = useState('');

  if (disabled) return null;

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value.trim());
      setValue('');
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder={placeholder}
        className="flex-1 rounded-md border border-[#d8dde5] px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#00b4ed]/40 focus:border-[#00b4ed]"
        disabled={disabled}
      />
      <button
        onClick={handleSubmit}
        disabled={!value.trim()}
        className="rounded-md bg-[#00b4ed] text-white px-5 py-2.5 text-[13px] font-medium hover:bg-[#0090d9] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        送信
      </button>
    </div>
  );
}
