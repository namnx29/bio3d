import React from 'react';
import { RotateCcw, Tag, Volume2, VolumeX, Info, Sun, Moon, Sparkles } from 'lucide-react';

interface RightToolbarProps {
  onResetCamera: () => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  isAudioPlaying: boolean;
  onToggleAudio: () => void;
  onToggleInfo: () => void;
  isInfoOpen: boolean;
  lightingMode: 'day' | 'fluorescent' | 'studio';
  onCycleLighting: () => void;
}

export const RightToolbar: React.FC<RightToolbarProps> = ({
  onResetCamera,
  showLabels,
  onToggleLabels,
  isAudioPlaying,
  onToggleAudio,
  onToggleInfo,
  isInfoOpen,
  lightingMode,
  onCycleLighting
}) => {
  return (
    <aside className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center bg-[#1e3a8a]/90 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-white/20 gap-2">
      {/* 1. Reset Camera button */}
      <button
        onClick={onResetCamera}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-105 active:scale-95"
        title="Đặt lại góc nhìn camera ban đầu"
      >
        <RotateCcw className="w-5 h-5" />
      </button>

      {/* 2. Toggle Labels button */}
      <button
        onClick={onToggleLabels}
        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-95 ${
          showLabels
            ? 'bg-blue-500 text-white shadow-sm'
            : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'
        }`}
        title={showLabels ? 'Ẩn nhãn chú thích' : 'Hiện nhãn chú thích'}
      >
        <Tag className="w-5 h-5" />
      </button>

      {/* 3. Audio Narration button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onToggleAudio();
        }}
        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-95 ${
          isAudioPlaying
            ? 'bg-emerald-500 text-white animate-pulse'
            : 'bg-white/10 hover:bg-white/20 text-white'
        }`}
        title={isAudioPlaying ? 'Dừng đọc thuyết minh' : 'Bật thuyết minh âm thanh tiếng Việt'}
      >
        {isAudioPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
      </button>

      {/* 4. Info Panel toggle */}
      <button
        onClick={onToggleInfo}
        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-95 ${
          isInfoOpen
            ? 'bg-amber-500 text-white shadow-sm'
            : 'bg-white/10 hover:bg-white/20 text-white'
        }`}
        title="Xem bảng thông tin chi tiết sinh học"
      >
        <Info className="w-5 h-5" />
      </button>

      {/* 5. Lighting / Theme switch */}
      <button
        onClick={onCycleLighting}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-105 active:scale-95"
        title={`Chế độ chiếu sáng: ${
          lightingMode === 'day'
            ? 'Ban ngày / Phòng học'
            : lightingMode === 'fluorescent'
            ? 'Kính hiển vi huỳnh quang'
            : 'Studio 3D ấm'
        }`}
      >
        {lightingMode === 'day' && <Sun className="w-5 h-5 text-amber-300" />}
        {lightingMode === 'fluorescent' && <Moon className="w-5 h-5 text-cyan-300" />}
        {lightingMode === 'studio' && <Sparkles className="w-5 h-5 text-yellow-300" />}
      </button>
    </aside>
  );
};
