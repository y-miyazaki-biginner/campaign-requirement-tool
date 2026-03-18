interface Props {
  onReset: () => void;
}

export function Header({ onReset }: Props) {
  return (
    <header className="bg-gradient-to-r from-[#00b4ed] to-[#0090d9] px-6 py-3 flex items-center justify-between flex-shrink-0 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white text-sm font-bold">
          施
        </div>
        <div>
          <h1 className="text-base font-bold text-white">施策要件整理ツール</h1>
          <p className="text-xs text-white/70">質問に答えて要件を整理しましょう</p>
        </div>
      </div>
      <button
        onClick={onReset}
        className="text-xs text-white/70 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all"
      >
        最初からやり直す
      </button>
    </header>
  );
}
