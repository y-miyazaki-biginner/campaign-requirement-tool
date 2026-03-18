import type { RequirementState } from '../../types/requirement';
import { exportAsJSON, exportAsCSV, downloadFile } from '../../utils/export';

interface Props {
  state: RequirementState;
}

export function ExportButton({ state }: Props) {
  const isComplete = state.currentPhase === 'complete';
  if (!isComplete) return null;

  return (
    <div className="p-3 border-t border-[#e0e4ea] bg-white flex gap-2">
      <button
        onClick={() => {
          const json = exportAsJSON(state);
          downloadFile(json, `要件_${state.campaignName}.json`, 'application/json');
        }}
        className="flex-1 rounded-md bg-[#00b4ed] text-white py-2 text-[13px] font-medium hover:bg-[#0090d9] transition-all"
      >
        JSON出力
      </button>
      <button
        onClick={() => {
          const csv = exportAsCSV(state);
          downloadFile(csv, `要件_${state.campaignName}.csv`, 'text/csv');
        }}
        className="flex-1 rounded-md bg-white text-[#313131] border border-[#d8dde5] py-2 text-[13px] font-medium hover:bg-[#f7f8fa] transition-all"
      >
        CSV出力
      </button>
    </div>
  );
}
