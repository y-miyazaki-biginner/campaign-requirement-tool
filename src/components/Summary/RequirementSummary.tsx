import type { RequirementState } from '../../types/requirement';

interface Props {
  state: RequirementState;
}

export function RequirementSummary({ state }: Props) {
  const hasContent = state.campaignName !== '';

  if (!hasContent) {
    return (
      <div className="p-6 flex items-center justify-center h-full text-[#8b95a5] text-[13px]">
        <div className="text-center">
          <div className="text-4xl mb-3">📋</div>
          <p>質問に回答すると</p>
          <p>ここに要件が表示されます</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 overflow-y-auto h-full">
      <h2 className="text-[11px] font-bold text-[#8b95a5] uppercase tracking-wider mb-4">
        要件サマリー
      </h2>

      <Section title="基本情報" icon="🏢">
        <Item label="業界" value={state.industryName} />
        <Item label="施策" value={state.campaignName} />
      </Section>

      {state.target.conditions.length > 0 && (
        <Section title="① 誰に送るか" icon="👥">
          <ListItem label="配信対象" items={state.target.conditions} />
          {state.target.exclusions.length > 0 && (
            <ListItem label="配信対象外" items={state.target.exclusions} color="red" />
          )}
        </Section>
      )}

      {state.content.hasPersonalization !== undefined && state.currentPhase !== 'industry' && state.currentPhase !== 'campaign' && state.currentPhase !== 'target' && (
        <Section title="② 何を送るか" icon="📝">
          <Item label="パーソナライズ" value={state.content.hasPersonalization ? 'あり' : 'なし'} />
          {state.content.personalizationFields.length > 0 && (
            <ListItem label="差し込み項目" items={state.content.personalizationFields} color="blue" />
          )}
          {state.content.maxCount && <Item label="最大表示件数" value={`${state.content.maxCount}件`} />}
          {state.content.notes && <Item label="補足" value={state.content.notes} />}
        </Section>
      )}

      {state.timing.type && (
        <Section title="③ いつ送るか" icon="⏰">
          <Item
            label="配信種別"
            value={
              state.timing.type === 'immediate'
                ? '即時配信'
                : state.timing.type === 'schedule'
                ? 'スケジュール配信'
                : 'シナリオ配信'
            }
          />
          {state.timing.scheduleTime && <Item label="スケジュール" value={state.timing.scheduleTime} />}
          {state.timing.triggerEvent && <Item label="トリガー" value={state.timing.triggerEvent} />}
          {state.timing.scenarioDetails && <Item label="シナリオ詳細" value={state.timing.scenarioDetails} />}
        </Section>
      )}

      {(state.data.uploadedFileName || state.data.suggestedSources.length > 0 || state.data.notes) && (
        <Section title="④ データ要件" icon="🗄️">
          {state.data.uploadedFileName && <Item label="データソース" value={state.data.uploadedFileName} />}
          {state.data.suggestedSources.length > 0 && (
            <div className="mt-2">
              <span className="text-[11px] text-[#8b95a5]">推奨データソース:</span>
              {state.data.suggestedSources.map((s, i) => (
                <div key={i} className="ml-2 mt-1 text-[11px] text-[#555] bg-[#f7f8fa] rounded-md p-2">
                  <span className="font-medium">{s.tableName}</span>
                  {s.columnName && <span className="text-[#8b95a5]">.{s.columnName}</span>}
                  <span className="block text-[#8b95a5] mt-0.5">{s.matchReason}</span>
                </div>
              ))}
            </div>
          )}
          {state.data.notes && <Item label="補足" value={state.data.notes} />}
        </Section>
      )}
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 bg-white rounded-md border border-[#e0e4ea] p-3">
      <h3 className="text-[11px] font-bold text-[#555] mb-2 flex items-center gap-1.5 border-b border-[#e0e4ea] pb-1.5">
        <span>{icon}</span> {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-[11px]">
      <span className="text-[#8b95a5] flex-shrink-0 w-20">{label}</span>
      <span className="text-[#313131]">{value}</span>
    </div>
  );
}

function ListItem({ label, items, color = 'green' }: { label: string; items: string[]; color?: string }) {
  const colorMap: Record<string, string> = {
    green: 'bg-[#e8f5e9] text-[#2e7d32]',
    red: 'bg-[#fce4ec] text-[#c62828]',
    blue: 'bg-[#e3f2fd] text-[#1565c0]',
  };
  return (
    <div className="text-[11px]">
      <span className="text-[#8b95a5]">{label}</span>
      <div className="flex flex-wrap gap-1 mt-1">
        {items.map((item, i) => (
          <span key={i} className={`${colorMap[color] || colorMap.green} px-2 py-0.5 rounded-sm text-[10px]`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
