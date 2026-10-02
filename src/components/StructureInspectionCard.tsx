import React, { useState } from 'react';
import { ProkaryoteStructureDetail } from '../types/biology';
import { X, Volume2, Sparkles, BookOpen, Layers, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

interface StructureInspectionCardProps {
  structure: ProkaryoteStructureDetail | null;
  onClose: () => void;
  onSpeak: (text: string) => void;
  isSpeaking: boolean;
}

export const StructureInspectionCard: React.FC<StructureInspectionCardProps> = ({
  structure,
  onClose,
  onSpeak,
  isSpeaking
}) => {
  const [showMore, setShowMore] = useState(false);

  if (!structure) return null;

  const handleSpeak = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const text = `${structure.vietnameseName}. Vị trí: ${structure.location}. Cấu tạo: ${structure.chemicalComposition}. Chức năng: ${structure.functionText}`;
    onSpeak(text);
  };

  return (
    <div className="absolute right-5 bottom-20 z-30 w-96 max-w-[calc(100vw-2.5rem)] bg-slate-900/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden text-white animate-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <span
            className="w-3.5 h-3.5 rounded-full ring-2 ring-white/40 shrink-0"
            style={{ backgroundColor: structure.color }}
          />
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">
              {structure.vietnameseName}
            </h3>
            <span className="text-[11px] text-blue-200">{structure.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleSpeak}
            className={`p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors ${
              isSpeaking ? 'bg-emerald-500 text-white animate-pulse' : ''
            }`}
            title="Đọc thuyết minh giọng nói tiếng Việt"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3.5 text-xs text-slate-200">
        {/* Core Function (Primary highlight for Grade 10) */}
        <div className="p-3.5 rounded-2xl bg-blue-950/60 border border-blue-500/30 space-y-1">
          <div className="flex items-center gap-1.5 text-blue-300 font-bold uppercase tracking-wider text-[10px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Chức năng sinh học cốt lõi</span>
          </div>
          <p className="text-xs text-white leading-relaxed font-medium">
            {structure.functionText}
          </p>
        </div>

        {/* Location & Composition */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-white/10 space-y-0.5">
            <span className="text-slate-400 font-semibold block">Vị trí:</span>
            <span className="text-slate-200">{structure.location}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-white/10 space-y-0.5">
            <span className="text-slate-400 font-semibold block">Thành phần hóa học:</span>
            <span className="text-slate-200">{structure.chemicalComposition}</span>
          </div>
        </div>

        {/* Expandable "Tìm hiểu thêm" button */}
        <button
          onClick={() => setShowMore(!showMore)}
          className="w-full py-2 bg-slate-800/90 hover:bg-slate-700/90 rounded-xl text-slate-300 hover:text-white font-semibold flex items-center justify-center gap-1.5 transition-colors text-xs"
        >
          <span>{showMore ? 'Thu gọn' : 'Tìm hiểu thêm kiến thức trọng tâm'}</span>
          {showMore ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showMore && (
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/10 text-xs text-slate-300 space-y-1.5 animate-in fade-in duration-150">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px]">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Ghi chú SGK Kết nối tri thức - Bài 7:</span>
            </div>
            <p className="leading-relaxed text-slate-300">{structure.curriculumNotes}</p>
          </div>
        )}
      </div>
    </div>
  );
};
