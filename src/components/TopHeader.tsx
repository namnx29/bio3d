import React from 'react';
import { ArrowLeft, PenTool, Edit3, BookOpen } from 'lucide-react';
import { ActiveModule } from '../types/biology';

interface TopHeaderProps {
  onExit: () => void;
  isDrawingActive: boolean;
  onToggleDrawing: () => void;
  onOpenWhiteboard: () => void;
  onOpenQuiz: () => void;
  activeModule: ActiveModule;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onExit,
  isDrawingActive,
  onToggleDrawing,
  onOpenWhiteboard,
  onOpenQuiz,
  activeModule
}) => {
  // Dynamic title based on active module
  const getModuleTitle = () => {
    switch (activeModule) {
      case '01_scale':
        return 'Tế bào nhân sơ';
      case '02_bacteria':
        return 'Hình thái & Kích thước Vi khuẩn';
      case '03_prokaryote_structure':
        return 'Cấu tạo Tế bào nhân sơ';
      case '04_compare':
        return 'So sánh Tế bào nhân sơ & Nhân thực';
      case '05_cell_wall':
        return 'Thành tế bào & Màng sinh chất (Gram+ / Gram-)';
      default:
        return 'Tế bào nhân sơ';
    }
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-5 py-3 pointer-events-none">
      {/* Left: Exit button & Chapter Title */}
      <div className="flex items-center gap-3.5 pointer-events-auto">
        <button
          onClick={onExit}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white text-slate-800 text-sm font-medium shadow-sm border border-slate-200/80 transition-all hover:shadow active:scale-95"
          title="Về góc nhìn tổng quan ban đầu"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
          <span>Thoát</span>
        </button>

        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight drop-shadow-xs">
            {getModuleTitle()}
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
            Sinh học 10
          </span>
        </div>
      </div>

      {/* Right Tools: Bút, Bảng trắng, Bài tập */}
      <div className="flex items-center gap-2.5 pointer-events-auto">
        {/* Bút (Draw / Annotation) */}
        <button
          onClick={onToggleDrawing}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium border shadow-xs transition-all active:scale-95 ${
            isDrawingActive
              ? 'bg-blue-600 text-white border-blue-500 shadow-md ring-2 ring-blue-300'
              : 'bg-white/90 hover:bg-white text-slate-700 border-slate-200 hover:text-slate-900'
          }`}
          title="Vẽ ghi chú trực tiếp lên mô hình 3D"
        >
          <PenTool className="w-4 h-4 text-slate-600 group-hover:text-blue-600" />
          <span>Bút</span>
        </button>

        {/* Bảng trắng (Whiteboard) */}
        <button
          onClick={onOpenWhiteboard}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 text-sm font-medium border border-slate-200 shadow-xs transition-all active:scale-95"
          title="Mở bảng ghi chú giảng dạy và tóm tắt lý thuyết"
        >
          <Edit3 className="w-4 h-4 text-slate-600" />
          <span>Bảng trắng</span>
        </button>

        {/* Bài tập (Quiz / Practice) */}
        <button
          onClick={onOpenQuiz}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 text-sm font-medium border border-slate-200 shadow-xs transition-all active:scale-95"
          title="Luyện tập câu hỏi trắc nghiệm Sinh học 10"
        >
          <BookOpen className="w-4 h-4 text-slate-600" />
          <span>Bài tập</span>
        </button>
      </div>
    </header>
  );
};
