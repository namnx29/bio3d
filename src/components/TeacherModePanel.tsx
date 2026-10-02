import React from 'react';
import { PROKARYOTE_STRUCTURES } from '../data/biologyData';
import { ProkaryoteStructureId, ProkaryoteStructureDetail, MagnificationLevel } from '../types/biology';
import {
  GraduationCap,
  Maximize2,
  Minimize2,
  RotateCcw,
  Tag,
  Layers,
  Sparkles,
  HelpCircle,
  Eye,
  X
} from 'lucide-react';

interface TeacherModePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStructure: (struct: ProkaryoteStructureDetail | null) => void;
  selectedStructureId: ProkaryoteStructureId | null;
  onToggleLabels: () => void;
  showLabels: boolean;
  onReset: () => void;
  onOpenTasks: () => void;
  onSetExplosion: (val: number) => void;
  onSetMagnification: (lvl: MagnificationLevel) => void;
}

export const TeacherModePanel: React.FC<TeacherModePanelProps> = ({
  isOpen,
  onClose,
  onSelectStructure,
  selectedStructureId,
  onToggleLabels,
  showLabels,
  onReset,
  onOpenTasks,
  onSetExplosion,
  onSetMagnification
}) => {
  if (!isOpen) return null;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <aside className="absolute right-4 top-16 z-40 w-80 bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-amber-500/40 p-4 text-white flex flex-col gap-3.5 animate-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Bảng điều khiển Giáo viên
            </h3>
            <span className="text-[10px] text-slate-400">Tối ưu trình chiếu & Giảng dạy 3D</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Presentation Tools */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <button
          onClick={toggleFullscreen}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-2 font-medium transition-colors"
        >
          <Maximize2 className="w-4 h-4 text-amber-400" />
          <span>Toàn màn hình</span>
        </button>

        <button
          onClick={onToggleLabels}
          className={`p-2.5 rounded-xl flex items-center gap-2 font-medium transition-colors ${
            showLabels ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>{showLabels ? 'Ẩn tất cả nhãn' : 'Hiện nhãn 3D'}</span>
        </button>

        <button
          onClick={onOpenTasks}
          className="p-2.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/30 flex items-center gap-2 font-medium transition-colors col-span-2"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Chiếu bài tập tương tác cho học sinh</span>
        </button>
      </div>

      {/* Structure Spotlight Presentation (Solo select) */}
      <div className="space-y-1.5 pt-1 border-t border-white/10">
        <span className="text-[11px] font-bold text-slate-300 block">
          Trình chiếu tiêu điểm từng cấu trúc:
        </span>
        <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1 no-scrollbar">
          {PROKARYOTE_STRUCTURES.map(st => {
            const isCur = selectedStructureId === st.id;
            return (
              <button
                key={st.id}
                onClick={() => onSelectStructure(isCur ? null : st)}
                className={`p-2 rounded-xl text-[11px] font-semibold text-left truncate transition-all ${
                  isCur
                    ? 'bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-300 font-bold'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                }`}
              >
                {st.vietnameseName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Stage Shortcuts */}
      <div className="space-y-1.5 pt-1 border-t border-white/10 text-xs">
        <span className="text-[11px] font-bold text-slate-300 block">
          Chuyển nhanh góc nhìn bài giảng:
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => {
              onSetExplosion(0);
              onSetMagnification(1);
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] text-center"
          >
            Tế bào nguyên vẹn
          </button>
          <button
            onClick={() => {
              onSetExplosion(60);
              onSetMagnification(2);
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] text-center"
          >
            Tách 5 lớp bọc
          </button>
          <button
            onClick={() => {
              onSetExplosion(0);
              onSetMagnification(4);
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] text-center col-span-2"
          >
            Phóng đại siêu vi (Ribosome / ADN vòng)
          </button>
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Đặt lại toàn bộ mô hình</span>
      </button>
    </aside>
  );
};
