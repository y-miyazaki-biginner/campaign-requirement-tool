import type { Industry, IndustryWithCampaigns, Campaign } from '../types/requirement';
import campaignsData from './campaignsData.json';

export const industries: Industry[] = [
  { id: 'ec', name: 'EC専業', icon: '🛒' },
  { id: 'ec-omni', name: 'EC/店舗オムニ', icon: '🏬' },
  { id: 'tob', name: 'toB', icon: '🏢' },
  { id: 'school-course', name: 'スクール_講座系', icon: '📚' },
  { id: 'school-academic', name: 'スクール_学校系', icon: '🎓' },
  { id: 'media', name: 'メディア(情報系)', icon: '📰' },
  { id: 'store-visit', name: '来店型', icon: '🏪' },
  { id: 'ec-store', name: 'EC×来店', icon: '🛍️' },
  { id: 'realestate', name: '不動産販売', icon: '🏠' },
  { id: 'hr-agent', name: '人材(紹介)', icon: '🤝' },
  { id: 'hotel', name: 'ホテル', icon: '🏨' },
  { id: 'leisure', name: 'レジャー', icon: '🎡' },
  { id: 'travel', name: '旅行', icon: '✈️' },
  { id: 'hr-ad', name: '人材（広告）', icon: '📢' },
  { id: 'bridal', name: 'ブライダル', icon: '💒' },
  { id: 'infra', name: '公共インフラ', icon: '🏗️' },
  { id: 'hr-dispatch', name: '人材(派遣)', icon: '👔' },
];

const industryKeyMap: Record<string, string> = {
  'ec': 'EC専業',
  'ec-omni': 'EC店舗オムニ',
  'tob': 'toB',
  'school-course': 'スクール_講座系',
  'school-academic': 'スクール_学校系',
  'store-visit': '来店型',
  'ec-store': 'EC×来店',
  'realestate': '不動産販売',
  'hotel': 'ホテル',
  'leisure': 'レジャー',
  'travel': '旅行',
  'hr-ad': '人材広告',
  'bridal': 'ブライダル',
  'infra': '公共インフラ',
  'hr-agent': 'マッチング',
};

interface CampaignData {
  name: string;
  target: string;
  description: string;
}

function toCampaignId(name: string): string {
  return name
    .replace(/[（(]/g, '_')
    .replace(/[）)]/g, '')
    .replace(/[/／]/g, '_')
    .replace(/[×]/g, 'x')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 50);
}

function buildCampaigns(items: CampaignData[]): Campaign[] {
  return items.map((item) => ({
    id: toCampaignId(item.name),
    name: item.name,
    description: item.description,
    defaults: {
      targetDescription: item.target,
      targetOptions: item.target ? [item.target] : undefined,
    },
  }));
}

export const campaignMaster: IndustryWithCampaigns[] = industries.map((industry) => {
  const jsonKey = industryKeyMap[industry.id];
  const data = jsonKey ? (campaignsData as Record<string, CampaignData[]>)[jsonKey] : undefined;
  const campaigns = data ? buildCampaigns(data) : [];
  return { industry, campaigns };
});

export function getCampaignsByIndustry(industryId: string): IndustryWithCampaigns | undefined {
  return campaignMaster.find((item) => item.industry.id === industryId);
}

export function getCampaign(industryId: string, campaignId: string) {
  const industryData = getCampaignsByIndustry(industryId);
  return industryData?.campaigns.find((c) => c.id === campaignId);
}
