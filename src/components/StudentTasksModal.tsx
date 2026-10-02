import React, { useState } from 'react';
import { STUDENT_INTERACTIVE_TASKS } from '../data/biologyData';
import { InteractiveTask, ProkaryoteStructureId } from '../types/biology';
import {
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowUpDown,
  RotateCcw,
  Trophy,
  Sparkles,
  ChevronRight,
  MoveUp,
  MoveDown
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StudentTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  lastClickedStructureId: ProkaryoteStructureId | null;
}

export const StudentTasksModal: React.FC<StudentTasksModalProps> = ({
  isOpen,
  onClose,
  lastClickedStructureId
}) => {
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(0);
  const [userSelectedOption, setUserSelectedOption] = useState<number | null>(null);
  const [taskStatus, setTaskStatus] = useState<{ [id: string]: 'unanswered' | 'correct' | 'incorrect' }>({});
  
  // State for Dạng 2: Match Pairs
  const [userPairs, setUserPairs] = useState<{ [id: string]: string }>({});
  
  // State for Dạng 3: Sort Layers
  const [sortedLayers, setSortedLayers] = useState<string[]>([
    'plasma_membrane',
    'nucleoid',
    'capsule',
    'cell_wall',
    'cytoplasm'
  ]);

  if (!isOpen) return null;

  const currentTask = STUDENT_INTERACTIVE_TASKS[currentTaskIndex];
  const isAnswered = taskStatus[currentTask.id] !== undefined && taskStatus[currentTask.id] !== 'unanswered';

  // Check 3D Click identification (Dạng 1)
  const handleVerify3DClick = (structureId: ProkaryoteStructureId) => {
    if (structureId === currentTask.targetStructureId) {
      setTaskStatus({ ...taskStatus, [currentTask.id]: 'correct' });
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } else {
      setTaskStatus({ ...taskStatus, [currentTask.id]: 'incorrect' });
    }
  };

  // Check Option selection (Dạng 4, 5, 6)
  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setUserSelectedOption(idx);
    if (idx === currentTask.correctAnswer) {
      setTaskStatus({ ...taskStatus, [currentTask.id]: 'correct' });
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } else {
      setTaskStatus({ ...taskStatus, [currentTask.id]: 'incorrect' });
    }
  };

  // Check Dạng 3: Sort Layers verification
  const handleVerifySortLayers = () => {
    const expected = ['capsule', 'cell_wall', 'plasma_membrane', 'cytoplasm', 'nucleoid'];
    const isCorrect = JSON.stringify(sortedLayers) === JSON.stringify(expected);
    if (isCorrect) {
      setTaskStatus({ ...taskStatus, [currentTask.id]: 'correct' });
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    } else {
      setTaskStatus({ ...taskStatus, [currentTask.id]: 'incorrect' });
    }
  };

  const moveLayer = (idx: number, direction: 'up' | 'down') => {
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === sortedLayers.length - 1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const copy = [...sortedLayers];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    setSortedLayers(copy);
  };

  // Check Dạng 2: Match Pairs verification
  const handlePairSelection = (structId: string, funcText: string) => {
    setUserPairs({ ...userPairs, [structId]: funcText });
  };

  const handleVerifyPairs = () => {
    const pairs = currentTask.pairs || [];
    let allCorrect = true;
    pairs.forEach((p: { id: string; structure: string; func: string }) => {
      if (userPairs[p.id] !== p.func) allCorrect = false;
    });
    if (allCorrect && Object.keys(userPairs).length === pairs.length) {
      setTaskStatus({ ...taskStatus, [currentTask.id]: 'correct' });
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    } else {
      setTaskStatus({ ...taskStatus, [currentTask.id]: 'incorrect' });
    }
  };

  // Next task
  const handleNextTask = () => {
    if (currentTaskIndex < STUDENT_INTERACTIVE_TASKS.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
      setUserSelectedOption(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-slate-900 rounded-3xl shadow-2xl border border-white/20 overflow-hidden flex flex-col text-white max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              🎯
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Nhiệm vụ Tương tác Học sinh (6 Dạng Bài tập)</h2>
              <p className="text-xs text-blue-200">Sinh học 10 · Bộ sách Kết nối tri thức với cuộc sống · Bài 7</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Tabs */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 bg-slate-950/60 border-b border-white/10 overflow-x-auto no-scrollbar">
          {STUDENT_INTERACTIVE_TASKS.map((t, idx) => {
            const isCur = idx === currentTaskIndex;
            const status = taskStatus[t.id];
            return (
              <button
                key={t.id}
                onClick={() => {
                  setCurrentTaskIndex(idx);
                  setUserSelectedOption(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isCur
                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <span>{`Nhiệm vụ ${idx + 1}`}</span>
                {status === 'correct' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                {status === 'incorrect' && <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
              </button>
            );
          })}
        </div>

        {/* Task Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
          {/* Title & Prompt */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              {currentTask.title}
            </span>
            <h3 className="text-base font-bold text-white leading-snug">
              {currentTask.question}
            </h3>
          </div>

          {/* DẠNG 1: Tìm cấu trúc trên mô hình 3D */}
          {currentTask.type === 'identify_3d' && (
            <div className="p-4 rounded-2xl bg-blue-950/50 border border-blue-800/60 space-y-3">
              <p className="text-xs text-blue-200">
                👉 <strong>Hướng dẫn:</strong> Đóng bảng này hoặc nhìn vào không gian 3D, hãy nhấp chuột trực tiếp vào cấu trúc tương ứng. Hoặc bạn có thể bấm kiểm tra với cấu trúc đang chọn:
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { id: 'capsule', name: 'Vỏ nhầy' },
                  { id: 'cell_wall', name: 'Thành tế bào' },
                  { id: 'plasma_membrane', name: 'Màng sinh chất' },
                  { id: 'nucleoid', name: 'Vùng nhân' },
                  { id: 'ribosome', name: 'Ribosome' },
                  { id: 'flagellum', name: 'Roi' },
                  { id: 'pili', name: 'Lông' },
                  { id: 'plasmid', name: 'Plasmid' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleVerify3DClick(item.id as ProkaryoteStructureId)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-blue-600 text-xs font-medium text-slate-200 hover:text-white transition-all border border-white/10"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* DẠNG 2: Ghép cấu trúc với chức năng (Match Pairs) */}
          {currentTask.type === 'match_pairs' && currentTask.pairs && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Chọn chức năng tương ứng cho từng cấu trúc bên dưới:
              </p>
              <div className="space-y-2">
                {currentTask.pairs.map((p: { id: string; structure: string; func: string }) => {
                  return (
                    <div
                      key={p.id}
                      className="p-3 rounded-2xl bg-slate-800/80 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                    >
                      <span className="font-bold text-white min-w-[150px]">{p.structure}:</span>
                      <select
                        value={userPairs[p.id] || ''}
                        onChange={e => handlePairSelection(p.id, e.target.value)}
                        className="flex-1 bg-slate-900 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- Chọn chức năng sinh học phù hợp --</option>
                        {currentTask.pairs!.map((opt: { id: string; structure: string; func: string }, oIdx: number) => (
                          <option key={oIdx} value={opt.func}>
                            {opt.func}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleVerifyPairs}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                >
                  Kiểm tra kết quả ghép cặp
                </button>
              </div>
            </div>
          )}

          {/* DẠNG 3: Sắp xếp thứ tự tách lớp (Sort Layers) */}
          {currentTask.type === 'sort_layers' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Sử dụng các nút mũi tên để di chuyển vị trí từng lớp, sắp xếp đúng từ <strong>NGOÀI CÙNG</strong> xuống <strong>TRONG CÙNG</strong>:
              </p>

              <div className="space-y-2">
                {sortedLayers.map((layerId, idx) => {
                  const nameMap: { [k: string]: string } = {
                    capsule: 'Vỏ nhầy (Capsule)',
                    cell_wall: 'Thành tế bào (Peptidoglycan)',
                    plasma_membrane: 'Màng sinh chất (Lớp kép phospholipid)',
                    cytoplasm: 'Tế bào chất (Cytoplasm)',
                    nucleoid: 'Vùng nhân (ADN xoắn kép dạng vòng)'
                  };

                  return (
                    <div
                      key={layerId}
                      className="p-3 rounded-2xl bg-slate-800/90 border border-white/10 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-white">{nameMap[layerId]}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          disabled={idx === 0}
                          onClick={() => moveLayer(idx, 'up')}
                          className="p-1 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-white"
                          title="Di chuyển lên"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={idx === sortedLayers.length - 1}
                          onClick={() => moveLayer(idx, 'down')}
                          className="p-1 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-white"
                          title="Di chuyển xuống"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleVerifySortLayers}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                >
                  Xác nhận thứ tự tách lớp
                </button>
              </div>
            </div>
          )}

          {/* DẠNG 4, 5, 6: Multiple Choice Options */}
          {(currentTask.type === 'scenario' ||
            currentTask.type === 'compare_task' ||
            currentTask.type === 'mystery_challenge') &&
            currentTask.options && (
              <div className="space-y-2.5">
                {currentTask.options.map((opt: string, oIdx: number) => {
                  let optStyle = 'border-white/10 bg-slate-800/70 hover:bg-slate-800 text-slate-200';
                  if (isAnswered) {
                    if (oIdx === currentTask.correctAnswer) {
                      optStyle = 'border-emerald-500 bg-emerald-950/80 text-emerald-100 ring-1 ring-emerald-400 font-semibold';
                    } else if (oIdx === userSelectedOption) {
                      optStyle = 'border-rose-500 bg-rose-950/80 text-rose-100 ring-1 ring-rose-400';
                    } else {
                      optStyle = 'border-white/5 bg-slate-900/60 text-slate-500';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(oIdx)}
                      className={`w-full text-left p-3.5 rounded-2xl border text-xs flex items-start gap-3 transition-all ${optStyle}`}
                    >
                      <span className="w-5 h-5 rounded-full flex items-center justify-center border font-bold text-[10px] shrink-0 mt-0.5">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="leading-relaxed flex-1">{opt}</span>
                      {isAnswered && oIdx === currentTask.correctAnswer && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                      {isAnswered && oIdx === userSelectedOption && oIdx !== currentTask.correctAnswer && (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

          {/* Explanation Box */}
          {isAnswered && (
            <div
              className={`p-4 rounded-2xl border text-xs animate-in fade-in duration-200 ${
                taskStatus[currentTask.id] === 'correct'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 font-bold mb-1">
                {taskStatus[currentTask.id] === 'correct' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Hoàn thành chính xác!</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span className="text-rose-300">Chưa chính xác, hãy xem phân tích:</span>
                  </>
                )}
              </div>
              <p className="leading-relaxed">{currentTask.explanation}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950/80 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Nhiệm vụ {currentTaskIndex + 1} / {STUDENT_INTERACTIVE_TASKS.length}
          </span>

          <div className="flex items-center gap-2.5">
            {currentTaskIndex < STUDENT_INTERACTIVE_TASKS.length - 1 && (
              <button
                onClick={handleNextTask}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <span>Nhiệm vụ tiếp theo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all"
            >
              Quay lại Mô hình 3D
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
