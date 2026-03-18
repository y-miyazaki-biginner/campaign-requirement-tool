export interface Industry {
  id: string;
  name: string;
  icon: string;
}

export interface CampaignDefaults {
  targetDescription?: string;
  targetOptions?: string[];
  exclusionOptions?: string[];
  hasPersonalization?: boolean;
  personalizationOptions?: string[];
  timingType?: 'immediate' | 'schedule' | 'scenario';
  triggerOptions?: string[];
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  defaults: CampaignDefaults;
}

export interface IndustryWithCampaigns {
  industry: Industry;
  campaigns: Campaign[];
}

export type PhaseId = 'industry' | 'campaign' | 'target' | 'content' | 'timing' | 'data' | 'complete';

export interface QuestionNode {
  id: string;
  phase: PhaseId;
  message: string;
  type: 'select' | 'multi-select' | 'text' | 'yesno' | 'file-upload' | 'info';
  options?: QuestionOption[];
  allowFreeInput?: boolean;
  next: (answer: string, state: RequirementState) => string | null;
}

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
}

export interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: number;
  questionId?: string;
  options?: QuestionOption[];
  type?: QuestionNode['type'];
  allowFreeInput?: boolean;
}

export interface TargetRequirement {
  conditions: string[];
  exclusions: string[];
}

export interface ContentRequirement {
  hasPersonalization: boolean;
  personalizationFields: string[];
  maxCount: string;
  notes: string;
}

export interface TimingRequirement {
  type: 'immediate' | 'schedule' | 'scenario' | '';
  scheduleTime: string;
  triggerEvent: string;
  scenarioDetails: string;
}

export interface DataRequirement {
  uploadedFileName: string;
  suggestedSources: DataSourceSuggestion[];
  notes: string;
}

export interface DataSourceSuggestion {
  tableName: string;
  columnName: string;
  description: string;
  matchReason: string;
}

export interface RequirementState {
  industryId: string;
  industryName: string;
  campaignId: string;
  campaignName: string;
  target: TargetRequirement;
  content: ContentRequirement;
  timing: TimingRequirement;
  data: DataRequirement;
  currentPhase: PhaseId;
  currentQuestionId: string;
  uploadedDataSources: DataSourceRow[];
}

export interface DataSourceRow {
  [key: string]: string;
}

export const initialRequirementState: RequirementState = {
  industryId: '',
  industryName: '',
  campaignId: '',
  campaignName: '',
  target: { conditions: [], exclusions: [] },
  content: { hasPersonalization: false, personalizationFields: [], maxCount: '', notes: '' },
  timing: { type: '', scheduleTime: '', triggerEvent: '', scenarioDetails: '' },
  data: { uploadedFileName: '', suggestedSources: [], notes: '' },
  currentPhase: 'industry',
  currentQuestionId: 'select-industry',
  uploadedDataSources: [],
};
