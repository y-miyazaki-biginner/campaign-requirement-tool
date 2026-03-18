import type { Message } from '../../types/requirement';

interface Props {
  message: Message;
}

export function MessageBubble({ message }: Props) {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} mb-3`}>
      <div
        className={`max-w-[90%] rounded-lg px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap ${
          isAssistant
            ? 'bg-white text-[#313131] border border-[#e0e4ea] shadow-sm'
            : 'bg-[#00b4ed] text-white shadow-sm'
        }`}
      >
        {message.content.split('\n').map((line, i) => {
          const parts = line.split(/(\*\*[^*]+\*\*)/g);
          return (
            <span key={i}>
              {i > 0 && <br />}
              {parts.map((part, j) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={j}>{part.slice(2, -2)}</strong>;
                }
                return <span key={j}>{part}</span>;
              })}
            </span>
          );
        })}
      </div>
    </div>
  );
}
