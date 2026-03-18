import { useEffect, useRef } from 'react';
import { useRequirement } from '../../store/requirementStore';
import { getNextQuestion, processAnswer } from '../../engine/flowEngine';
import { MessageBubble } from './MessageBubble';
import { OptionSelector } from './OptionSelector';
import { TextInput } from './TextInput';
import { FileUpload } from './FileUpload';
import type { Message } from '../../types/requirement';

export function ChatContainer() {
  const { state, messages, setState, addMessage, setUploadedData } = useRequirement();
  const bottomRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  // Send first question on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const result = getNextQuestion(state);
    if (result) {
      addMessage(result.message);
      if (result.updatedState !== state) {
        setState(result.updatedState);
      }
    }
  }, []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const lastMessage = messages[messages.length - 1];
  const isWaitingForInput = lastMessage?.role === 'assistant' && lastMessage.type !== 'info';
  const isComplete = state.currentPhase === 'complete';

  const handleAnswer = (answer: string) => {
    // Add user message
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: getDisplayAnswer(answer, lastMessage),
      timestamp: Date.now(),
    };
    addMessage(userMsg);

    // Process answer and get updated state
    const newState = processAnswer(answer, state);
    setState(newState);

    // Get next question
    setTimeout(() => {
      const result = getNextQuestion(newState);
      if (result) {
        addMessage(result.message);
        if (result.updatedState !== newState) {
          setState(result.updatedState);
          // If info type (auto-advance), get next question
          if (result.message.type === 'info' && result.updatedState.currentQuestionId !== 'complete') {
            setTimeout(() => {
              const next = getNextQuestion(result.updatedState);
              if (next) {
                addMessage(next.message);
                if (next.updatedState !== result.updatedState) {
                  setState(next.updatedState);
                }
              }
            }, 500);
          }
        }
      }
    }, 300);
  };

  const handleFileUpload = (data: import('../../types/requirement').DataSourceRow[], fileName: string) => {
    setUploadedData(data, fileName);

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: `📎 ${fileName} をアップロードしました（${data.length}行）`,
      timestamp: Date.now(),
    };
    addMessage(userMsg);

    const newState = {
      ...state,
      uploadedDataSources: data,
      data: { ...state.data, uploadedFileName: fileName },
      currentQuestionId: 'data-suggestions',
    };
    setState(newState);

    setTimeout(() => {
      const result = getNextQuestion(newState);
      if (result) {
        addMessage(result.message);
        if (result.updatedState !== newState) {
          setState(result.updatedState);
          // Auto-advance to notes question
          setTimeout(() => {
            const next = getNextQuestion(result.updatedState);
            if (next) {
              addMessage(next.message);
              if (next.updatedState !== result.updatedState) {
                setState(next.updatedState);
              }
            }
          }, 500);
        }
      }
    }, 500);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      {!isComplete && (
        <div className="border-t border-[#e0e4ea] bg-[#f7f8fa] p-4">
          {isWaitingForInput && lastMessage.type === 'file-upload' && (
            <FileUpload
              onUpload={handleFileUpload}
              onSkip={() => handleAnswer('skip')}
            />
          )}
          {isWaitingForInput && (lastMessage.type === 'select' || lastMessage.type === 'multi-select' || lastMessage.type === 'yesno') && lastMessage.options && (
            <OptionSelector
              options={lastMessage.options}
              multiSelect={lastMessage.type === 'multi-select'}
              allowFreeInput={lastMessage.allowFreeInput}
              onSelect={handleAnswer}
            />
          )}
          {isWaitingForInput && lastMessage.type === 'text' && (
            <TextInput onSubmit={handleAnswer} />
          )}
        </div>
      )}
    </div>
  );
}

function getDisplayAnswer(answer: string, lastMessage: Message | undefined): string {
  if (!lastMessage?.options) return answer;
  // For select types, show the label instead of value
  const option = lastMessage.options.find((o) => o.value === answer);
  if (option) return option.label;
  // For multi-select, resolve each value
  return answer
    .split(',')
    .map((v) => {
      const opt = lastMessage.options?.find((o) => o.value === v.trim());
      return opt ? opt.label : v.trim();
    })
    .join('、');
}
