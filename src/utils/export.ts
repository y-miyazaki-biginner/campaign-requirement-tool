import type { RequirementState } from '../types/requirement';

export function exportAsJSON(state: RequirementState): string {
  const exportData = {
    業界: state.industryName,
    施策: state.campaignName,
    配信対象: {
      条件: state.target.conditions,
      除外条件: state.target.exclusions,
    },
    コンテンツ: {
      パーソナライズ: state.content.hasPersonalization,
      差し込み項目: state.content.personalizationFields,
      最大表示件数: state.content.maxCount || 'なし',
      補足: state.content.notes || 'なし',
    },
    配信タイミング: {
      種別: state.timing.type === 'immediate' ? '即時' : state.timing.type === 'schedule' ? 'スケジュール' : 'シナリオ',
      スケジュール: state.timing.scheduleTime || 'なし',
      トリガー: state.timing.triggerEvent || 'なし',
      シナリオ詳細: state.timing.scenarioDetails || 'なし',
    },
    データ要件: {
      アップロードファイル: state.data.uploadedFileName || 'なし',
      推奨データソース: state.data.suggestedSources.map((s) => ({
        テーブル: s.tableName,
        カラム: s.columnName,
        説明: s.description,
        マッチ理由: s.matchReason,
      })),
      補足: state.data.notes || 'なし',
    },
  };
  return JSON.stringify(exportData, null, 2);
}

export function exportAsCSV(state: RequirementState): string {
  const rows: string[][] = [
    ['カテゴリ', '項目', '値'],
    ['基本情報', '業界', state.industryName],
    ['基本情報', '施策', state.campaignName],
    ...state.target.conditions.map((c, i) => ['配信対象', `条件${i + 1}`, c]),
    ...state.target.exclusions.map((e, i) => ['配信対象', `除外条件${i + 1}`, e]),
    ['コンテンツ', 'パーソナライズ', state.content.hasPersonalization ? 'あり' : 'なし'],
    ...state.content.personalizationFields.map((f, i) => ['コンテンツ', `差し込み項目${i + 1}`, f]),
    ['コンテンツ', '補足', state.content.notes || 'なし'],
    ['タイミング', '種別', state.timing.type === 'immediate' ? '即時' : state.timing.type === 'schedule' ? 'スケジュール' : 'シナリオ'],
    ['タイミング', 'スケジュール', state.timing.scheduleTime || 'なし'],
    ['タイミング', 'トリガー', state.timing.triggerEvent || 'なし'],
    ['タイミング', 'シナリオ詳細', state.timing.scenarioDetails || 'なし'],
    ['データ', 'アップロードファイル', state.data.uploadedFileName || 'なし'],
    ...state.data.suggestedSources.map((s, i) => ['データ', `推奨ソース${i + 1}`, `${s.tableName}.${s.columnName} (${s.matchReason})`]),
    ['データ', '補足', state.data.notes || 'なし'],
  ];

  return rows
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob(['\uFEFF' + content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
