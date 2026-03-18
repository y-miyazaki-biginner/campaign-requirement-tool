import type { RequirementState, Message } from '../types/requirement';
import { buildQuestionTree, getDynamicOptions } from './questionTree';
import { industries } from './campaignMaster';
import { searchDataSources } from './dataSearch';

export function getNextQuestion(
  state: RequirementState
): { message: Message; updatedState: RequirementState } | null {
  const tree = buildQuestionTree(state);
  const node = tree.get(state.currentQuestionId);
  if (!node) return null;

  const dynamicOptions = getDynamicOptions(node.id, state);
  const options = dynamicOptions || node.options;

  // For data-suggestions, generate suggestions based on uploaded data
  if (node.id === 'data-suggestions' && state.uploadedDataSources.length > 0) {
    const suggestions = generateDataSuggestions(state);
    const suggestionText = suggestions.length > 0
      ? `アップロードされたデータから以下のデータソース候補が見つかりました:\n\n${suggestions.map((s, i) => `${i + 1}. **${s.tableName}${s.columnName ? '.' + s.columnName : ''}**\n   → ${s.matchReason}`).join('\n\n')}`
      : 'データソースの候補が見つかりませんでした。手動でデータ要件を記載してください。';

    const msg: Message = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: suggestionText,
      timestamp: Date.now(),
      questionId: node.id,
      type: 'info',
    };

    const nextId = node.next('', state);
    return {
      message: msg,
      updatedState: {
        ...state,
        currentQuestionId: nextId || 'complete',
        data: {
          ...state.data,
          suggestedSources: suggestions,
        },
      },
    };
  }

  const msg: Message = {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content: node.message,
    timestamp: Date.now(),
    questionId: node.id,
    options,
    type: node.type,
    allowFreeInput: node.allowFreeInput,
  };

  return { message: msg, updatedState: state };
}

export function processAnswer(
  answer: string,
  state: RequirementState
): RequirementState {
  const tree = buildQuestionTree(state);
  const node = tree.get(state.currentQuestionId);
  if (!node) return state;

  let newState = { ...state };

  // Update state based on the question answered
  switch (node.id) {
    case 'select-industry': {
      const industry = industries.find((i) => i.id === answer);
      newState.industryId = answer;
      newState.industryName = industry?.name || answer;
      newState.currentPhase = 'campaign';
      break;
    }
    case 'select-campaign': {
      const industryData = getDynamicOptions('select-campaign', newState);
      const campaign = industryData?.find((c) => c.value === answer);
      newState.campaignId = answer;
      newState.campaignName = campaign?.label || answer;
      newState.currentPhase = 'target';
      break;
    }
    case 'target-condition': {
      newState.target = {
        ...newState.target,
        conditions: answer.split(',').map((s) => s.trim()).filter(Boolean),
      };
      break;
    }
    case 'target-exclusion': {
      if (answer === 'no') {
        newState.currentPhase = 'content';
      }
      break;
    }
    case 'target-exclusion-detail': {
      newState.target = {
        ...newState.target,
        exclusions: answer.split(',').map((s) => s.trim()).filter(Boolean),
      };
      newState.currentPhase = 'content';
      break;
    }
    case 'content-personalization': {
      newState.content = {
        ...newState.content,
        hasPersonalization: answer === 'yes',
      };
      break;
    }
    case 'content-customer-fields': {
      newState.content = {
        ...newState.content,
        personalizationFields: answer.split(',').map((s) => s.trim()).filter(Boolean),
      };
      break;
    }
    case 'content-product-fields': {
      // yesno - no action needed, just routing
      break;
    }
    case 'content-product-fields-detail': {
      const productFields = answer.split(',').map((s) => s.trim()).filter(Boolean);
      newState.content = {
        ...newState.content,
        personalizationFields: [...newState.content.personalizationFields, ...productFields],
      };
      break;
    }
    case 'content-max-count': {
      newState.content = {
        ...newState.content,
        maxCount: answer,
      };
      break;
    }
    case 'content-notes': {
      if (answer !== 'なし' && answer !== '') {
        newState.content = { ...newState.content, notes: answer };
      }
      newState.currentPhase = 'timing';
      break;
    }
    case 'timing-type': {
      newState.timing = {
        ...newState.timing,
        type: answer as 'immediate' | 'schedule' | 'scenario',
      };
      break;
    }
    case 'timing-schedule': {
      newState.timing = { ...newState.timing, scheduleTime: answer };
      newState.currentPhase = 'data';
      break;
    }
    case 'timing-trigger': {
      newState.timing = { ...newState.timing, triggerEvent: answer };
      break;
    }
    case 'timing-scenario-detail': {
      if (answer !== 'なし' && answer !== '') {
        newState.timing = { ...newState.timing, scenarioDetails: answer };
      }
      newState.currentPhase = 'data';
      break;
    }
    case 'data-upload-prompt': {
      if (answer === 'skip') {
        newState.currentPhase = 'data';
      }
      break;
    }
    case 'data-notes': {
      if (answer !== 'なし' && answer !== '') {
        newState.data = { ...newState.data, notes: answer };
      }
      newState.currentPhase = 'complete';
      break;
    }
  }

  // Determine next question
  const nextId = node.next(answer, newState);
  newState.currentQuestionId = nextId || 'complete';

  // Handle immediate timing → skip to data
  if (node.id === 'timing-type' && answer === 'immediate') {
    newState.currentPhase = 'data';
  }

  return newState;
}

function generateDataSuggestions(state: RequirementState) {
  const keywords: string[] = [];

  // Collect keywords from requirements
  state.target.conditions.forEach((c) => keywords.push(...extractKeywords(c)));
  state.target.exclusions.forEach((e) => keywords.push(...extractKeywords(e)));
  state.content.personalizationFields.forEach((f) => keywords.push(...extractKeywords(f)));
  if (state.timing.triggerEvent) keywords.push(...extractKeywords(state.timing.triggerEvent));

  return searchDataSources(state.uploadedDataSources, keywords);
}

function extractKeywords(text: string): string[] {
  const stopWords = ['の', 'に', 'を', 'は', 'が', 'で', 'と', 'も', 'から', 'まで', 'より', '後', '前', '以内', '以上', '済み', 'した', 'する', 'ある', 'いる', 'なし', 'あり'];
  return text
    .replace(/[、。・「」（）\s]+/g, ' ')
    .split(' ')
    .filter((w) => w.length > 1 && !stopWords.includes(w));
}
