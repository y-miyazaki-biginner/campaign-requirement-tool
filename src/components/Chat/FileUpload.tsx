import { useRef } from 'react';
import Papa from 'papaparse';
import type { DataSourceRow } from '../../types/requirement';

interface Props {
  onUpload: (data: DataSourceRow[], fileName: string) => void;
  onSkip: () => void;
  disabled?: boolean;
}

export function FileUpload({ onUpload, onSkip, disabled }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  if (disabled) return null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        onUpload(results.data as DataSourceRow[], file.name);
      },
      error: () => {
        alert('CSVの解析に失敗しました。ファイルを確認してください。');
      },
    });
  };

  return (
    <div className="mb-3 flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          className="rounded-md bg-white text-[#313131] border border-[#d8dde5] px-4 py-2 text-[13px] font-medium hover:border-[#00b4ed] hover:bg-[#f0f9fd] transition-all"
        >
          CSVをアップロード
        </button>
        <button
          onClick={onSkip}
          className="rounded-md bg-[#f7f8fa] text-[#8b95a5] px-4 py-2 text-[13px] font-medium hover:bg-[#eceef2] transition-all"
        >
          スキップする
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept=".csv"
        onChange={handleFile}
        className="hidden"
      />
      <p className="text-[11px] text-[#8b95a5]">
        CSV形式（テーブル名, カラム名, 説明 等のヘッダー付き）
      </p>
    </div>
  );
}
