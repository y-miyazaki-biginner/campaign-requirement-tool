import type { QuestionNode, RequirementState } from '../types/requirement';
import { industries, getCampaignsByIndustry, getCampaign } from './campaignMaster';

export function buildQuestionTree(state: RequirementState): Map<string, QuestionNode> {
  const campaign = state.industryId && state.campaignId
    ? getCampaign(state.industryId, state.campaignId)
    : undefined;
  const defaults = campaign?.defaults;

  const nodes: QuestionNode[] = [
    // Phase 0: 業界・施策選択
    {
      id: 'select-industry',
      phase: 'industry',
      message: 'こんにちは！施策の要件整理をお手伝いします。\nまず、どの業界ですか？',
      type: 'select',
      options: industries.map((ind) => ({
        value: ind.id,
        label: `${ind.icon} ${ind.name}`,
      })),
      next: () => 'select-campaign',
    },
    {
      id: 'select-campaign',
      phase: 'campaign',
      message: 'どの施策を設定しますか？',
      type: 'select',
      options: [],
      next: () => 'target-condition',
    },

    // Phase 1: 誰に送るか
    {
      id: 'target-condition',
      phase: 'target',
      message: `配信対象はどのような顧客ですか？${defaults?.targetDescription ? `\n💡 この施策の一般的な対象：「${defaults.targetDescription}」` : ''}`,
      type: 'multi-select',
      options: (defaults?.targetOptions || ['全会員', '特定条件の顧客']).map((opt) => ({
        value: opt,
        label: opt,
      })),
      allowFreeInput: true,
      next: () => 'target-exclusion',
    },
    {
      id: 'target-exclusion',
      phase: 'target',
      message: '配信対象外にする条件はありますか？',
      type: 'yesno',
      options: [
        { value: 'yes', label: 'はい' },
        { value: 'no', label: 'いいえ' },
      ],
      next: (answer) => answer === 'yes' ? 'target-exclusion-detail' : 'content-personalization',
    },
    {
      id: 'target-exclusion-detail',
      phase: 'target',
      message: '除外条件を選択または入力してください。',
      type: 'multi-select',
      options: (defaults?.exclusionOptions || ['配信停止済み']).map((opt) => ({
        value: opt,
        label: opt,
      })),
      allowFreeInput: true,
      next: () => 'content-personalization',
    },

    // Phase 2: 何を送るか
    {
      id: 'content-personalization',
      phase: 'content',
      message: '配信内容にデータの差し込み（パーソナライズ）はありますか？',
      type: 'yesno',
      options: [
        { value: 'yes', label: 'はい' },
        { value: 'no', label: 'いいえ' },
      ],
      next: (answer) => answer === 'yes' ? 'content-customer-fields' : 'content-notes',
    },
    {
      id: 'content-customer-fields',
      phase: 'content',
      message: '顧客ごとに固定の情報で差し込むものを選んでください。',
      type: 'multi-select',
      options: [
        { value: '顧客名', label: '顧客名' },
        { value: 'メールアドレス', label: 'メールアドレス' },
        { value: '会員ランク', label: '会員ランク' },
        { value: '保有ポイント', label: '保有ポイント' },
        { value: 'クーポンコード', label: 'クーポンコード' },
      ],
      allowFreeInput: true,
      next: () => 'content-product-fields',
    },
    {
      id: 'content-product-fields',
      phase: 'content',
      message: '顧客ごとに異なる可変データ（商品情報など）の差し込みはありますか？',
      type: 'yesno',
      options: [
        { value: 'yes', label: 'はい' },
        { value: 'no', label: 'いいえ' },
      ],
      next: (answer) => answer === 'yes' ? 'content-product-fields-detail' : 'content-notes',
    },
    {
      id: 'content-product-fields-detail',
      phase: 'content',
      message: 'どのような可変データを差し込みますか？',
      type: 'multi-select',
      options: [
        { value: '商品名', label: '商品名' },
        { value: '商品画像', label: '商品画像' },
        { value: '商品価格', label: '商品価格' },
        { value: '商品URL', label: '商品URL' },
        { value: 'カテゴリ名', label: 'カテゴリ名' },
      ],
      allowFreeInput: true,
      next: () => 'content-max-count',
    },
    {
      id: 'content-max-count',
      phase: 'content',
      message: '可変データは1通あたり最大何件表示しますか？',
      type: 'select',
      options: [
        { value: '1', label: '1件' },
        { value: '3', label: '3件' },
        { value: '5', label: '5件' },
        { value: '10', label: '10件' },
      ],
      allowFreeInput: true,
      next: () => 'content-notes',
    },
    {
      id: 'content-notes',
      phase: 'content',
      message: 'コンテンツについて補足があれば入力してください。',
      type: 'text',
      allowFreeInput: true,
      options: [
        { value: 'skip', label: 'スキップ' },
      ],
      next: () => 'timing-type',
    },

    // Phase 3: いつ送るか
    {
      id: 'timing-type',
      phase: 'timing',
      message: '配信タイミングを選んでください。',
      type: 'select',
      options: [
        { value: 'immediate', label: '即時配信', description: '条件に合致したらすぐに配信' },
        { value: 'schedule', label: 'スケジュール配信', description: '指定した日時に一斉配信' },
        { value: 'scenario', label: 'シナリオ配信', description: 'トリガーイベント発生後に配信' },
      ],
      next: (answer) => {
        if (answer === 'schedule') return 'timing-schedule';
        if (answer === 'scenario') return 'timing-trigger';
        return 'data-upload-prompt';
      },
    },
    {
      id: 'timing-schedule',
      phase: 'timing',
      message: '配信日時を入力してください。\n例: 毎週月曜 10:00、毎月1日 9:00',
      type: 'text',
      allowFreeInput: true,
      next: () => 'data-upload-prompt',
    },
    {
      id: 'timing-trigger',
      phase: 'timing',
      message: 'トリガーとなるイベントを選択または入力してください。',
      type: 'select',
      options: (defaults?.triggerOptions || ['カスタムイベント']).map((opt) => ({
        value: opt,
        label: opt,
      })),
      allowFreeInput: true,
      next: () => 'timing-scenario-detail',
    },
    {
      id: 'timing-scenario-detail',
      phase: 'timing',
      message: 'シナリオの補足があれば入力してください。\n例: トリガー後◯時間待機、開封有無で分岐など',
      type: 'text',
      allowFreeInput: true,
      options: [
        { value: 'skip', label: 'スキップ' },
      ],
      next: () => 'data-upload-prompt',
    },

    // Phase 4: データ要件
    {
      id: 'data-upload-prompt',
      phase: 'data',
      message: '続いてデータ要件です。\n利用可能なデータソース一覧（CSV）があればアップロードしてください。',
      type: 'file-upload',
      options: [
        { value: 'skip', label: 'スキップ' },
      ],
      next: (answer) => answer === 'skip' ? 'data-notes' : 'data-suggestions',
    },
    {
      id: 'data-suggestions',
      phase: 'data',
      message: 'データソースを分析中...',
      type: 'info',
      next: () => 'data-notes',
    },
    {
      id: 'data-notes',
      phase: 'data',
      message: 'データ要件について補足があれば入力してください。',
      type: 'text',
      allowFreeInput: true,
      options: [
        { value: 'skip', label: 'スキップ' },
      ],
      next: () => 'complete',
    },

    // 完了
    {
      id: 'complete',
      phase: 'complete',
      message: '要件の整理が完了しました。\n右側のサマリーで内容を確認し、エクスポートしてください。',
      type: 'info',
      next: () => null,
    },
  ];

  const tree = new Map<string, QuestionNode>();
  nodes.forEach((node) => tree.set(node.id, node));
  return tree;
}

export function getDynamicOptions(questionId: string, state: RequirementState) {
  if (questionId === 'select-campaign') {
    const industryData = getCampaignsByIndustry(state.industryId);
    if (industryData) {
      return industryData.campaigns.map((c) => ({
        value: c.id,
        label: c.name,
        description: c.description,
      }));
    }
  }
  return undefined;
}
