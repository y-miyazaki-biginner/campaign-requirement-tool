import { createContext, useContext } from 'react';
import type { RequirementState, Message, DataSourceRow } from '../types/requirement';
import { initialRequirementState } from '../types/requirement';

export interface RequirementStore {
  state: RequirementState;
  messages: Message[];
  setState: (state: RequirementState) => void;
  addMessage: (message: Message) => void;
  setUploadedData: (data: DataSourceRow[], fileName: string) => void;
  reset: () => void;
}

export const RequirementContext = createContext<RequirementStore>({
  state: initialRequirementState,
  messages: [],
  setState: () => {},
  addMessage: () => {},
  setUploadedData: () => {},
  reset: () => {},
});

export function useRequirement() {
  return useContext(RequirementContext);
}
