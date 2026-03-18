import type { PhaseId, RequirementState } from '../../types/requirement';

interface Props {
  state: RequirementState;
}

const phases: { id: PhaseId; label: string; icon: string }[] = [
  { id: 'industry', label: '業界・施策選択', icon: '🏢' },
  { id: 'target', label: '誰に送るか', icon: '👥' },
  { id: 'content', label: '何を送るか', icon: '📝' },
  { id: 'timing', label: 'いつ送るか', icon: '⏰' },
  { id: 'data', label: 'データ要件', icon: '🗄️' },
  { id: 'complete', label: '完了', icon: '✅' },
];

const phaseOrder: PhaseId[] = ['industry', 'campaign', 'target', 'content', 'timing', 'data', 'complete'];

function getPhaseStatus(phaseId: PhaseId, currentPhase: PhaseId): 'done' | 'active' | 'pending' {
  const currentIndex = phaseOrder.indexOf(currentPhase);
  const phaseIndex = phaseOrder.indexOf(phaseId);
  if (phaseId === 'industry' && currentPhase === 'campaign') return 'active';
  if (phaseIndex < currentIndex) return 'done';
  if (phaseId === currentPhase) return 'active';
  return 'pending';
}

export function Sidebar({ state }: Props) {
  return (
    <div className="bg-[#f7f8fa] border-r border-gray-200 p-3 w-48 flex-shrink-0">
      <h2 className="text-[11px] font-bold text-[#8b95a5] uppercase tracking-wider mb-3 px-2">
        進捗
      </h2>
      <div className="space-y-0.5">
        {phases.map((phase) => {
          const status = getPhaseStatus(phase.id, state.currentPhase);
          return (
            <div
              key={phase.id}
              className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-all ${
                status === 'active'
                  ? 'bg-[#00b4ed]/10 text-[#00b4ed] font-semibold border-l-[3px] border-[#00b4ed]'
                  : status === 'done'
                  ? 'text-[#4caf50]'
                  : 'text-[#b0b8c4]'
              }`}
            >
              <span className="text-sm flex-shrink-0">
                {status === 'done' ? '✓' : phase.icon}
              </span>
              <span className="truncate">{phase.label}</span>
            </div>
          );
        })}
      </div>

      {state.industryName && (
        <div className="mt-5 pt-3 border-t border-gray-200">
          <h3 className="text-[10px] font-bold text-[#8b95a5] uppercase tracking-wider mb-2 px-2">選択中</h3>
          <div className="text-[11px] text-[#555] space-y-1 px-2">
            <p><span className="text-[#8b95a5]">業界:</span> {state.industryName}</p>
            {state.campaignName && (
              <p><span className="text-[#8b95a5]">施策:</span> {state.campaignName}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
