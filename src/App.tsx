import { useState, useCallback } from 'react';
import { RequirementContext } from './store/requirementStore';
import type { RequirementState, Message, DataSourceRow } from './types/requirement';
import { initialRequirementState } from './types/requirement';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { ChatContainer } from './components/Chat/ChatContainer';
import { RequirementSummary } from './components/Summary/RequirementSummary';
import { ExportButton } from './components/Summary/ExportButton';

function App() {
  const [state, setStateRaw] = useState<RequirementState>(initialRequirementState);
  const [messages, setMessages] = useState<Message[]>([]);
  const [resetKey, setResetKey] = useState(0);

  const setState = useCallback((newState: RequirementState) => {
    setStateRaw(newState);
  }, []);

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const setUploadedData = useCallback((data: DataSourceRow[], fileName: string) => {
    setStateRaw((prev) => ({
      ...prev,
      uploadedDataSources: data,
      data: { ...prev.data, uploadedFileName: fileName },
    }));
  }, []);

  const reset = useCallback(() => {
    setStateRaw(initialRequirementState);
    setMessages([]);
    setResetKey((k) => k + 1);
  }, []);

  return (
    <RequirementContext.Provider value={{ state, messages, setState, addMessage, setUploadedData, reset }}>
      <div className="h-screen flex flex-col bg-[#f2f4f7]">
        <Header onReset={reset} />
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Sidebar */}
          <Sidebar state={state} />

          {/* Center: Chat */}
          <div className="flex-[3] min-w-0 flex flex-col overflow-hidden bg-[#f2f4f7]">
            <ChatContainer key={resetKey} />
          </div>

          {/* Right: Summary */}
          <div className="flex-[1] min-w-[280px] max-w-[340px] border-l border-gray-200 bg-[#f2f4f7] flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <RequirementSummary state={state} />
            </div>
            <ExportButton state={state} />
          </div>
        </div>
      </div>
    </RequirementContext.Provider>
  );
}

export default App;
