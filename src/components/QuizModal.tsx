import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, RefreshCw, Trophy, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BIOLOGY_QUIZ_QUESTIONS } from '../data/biologyData';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: number]: number }>({});
  const [showExplanation, setShowExplanation] = useState<{ [qId: number]: boolean }>({});
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen) return null;

  const currentQ = BIOLOGY_QUIZ_QUESTIONS[currentIdx];
  const userAns = selectedAnswers[currentQ.id];
  const hasAnswered = userAns !== undefined;

  const handleSelectOption = (optIdx: number) => {
    if (hasAnswered) return; // Prevent changing after answered
    setSelectedAnswers({ ...selectedAnswers, [currentQ.id]: optIdx });
    setShowExplanation({ ...showExplanation, [currentQ.id]: true });

    // If answer is correct and last question, maybe celebrate
    if (optIdx === currentQ.correctAnswer && currentIdx === BIOLOGY_QUIZ_QUESTIONS.length - 1) {
      setTimeout(() => {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }, 300);
    }
  };

  const handleNext = () => {
    if (currentIdx < BIOLOGY_QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setIsFinished(true);
      // Calculate total score
      let score = 0;
      BIOLOGY_QUIZ_QUESTIONS.forEach(q => {
        if (selectedAnswers[q.id] === q.correctAnswer) score++;
      });
      if (score >= 4) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
      }
    }
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setShowExplanation({});
    setCurrentIdx(0);
    setIsFinished(false);
  };

  // Calculate score
  let correctCount = 0;
  BIOLOGY_QUIZ_QUESTIONS.forEach(q => {
    if (selectedAnswers[q.id] === q.correctAnswer) correctCount++;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
              📚
            </div>
            <div>
              <h2 className="text-base font-bold">Bài tập Luyện tập Sinh học 10</h2>
              <p className="text-xs text-blue-200">Chủ đề: Tế bào nhân sơ & Thang kích thước sinh học</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {!isFinished ? (
            <div className="space-y-5">
              {/* Progress Bar */}
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
                <span>Câu {currentIdx + 1} / {BIOLOGY_QUIZ_QUESTIONS.length}</span>
                <span>Điểm hiện tại: {correctCount}/{BIOLOGY_QUIZ_QUESTIONS.length}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / BIOLOGY_QUIZ_QUESTIONS.length) * 100}%` }}
                />
              </div>

              {/* Question Text */}
              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {currentQ.question}
              </h3>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, oIdx) => {
                  let optStyle = 'border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/50 text-slate-700';

                  if (hasAnswered) {
                    if (oIdx === currentQ.correctAnswer) {
                      optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium ring-1 ring-emerald-400';
                    } else if (oIdx === userAns) {
                      optStyle = 'border-red-500 bg-red-50 text-red-900 font-medium ring-1 ring-red-400';
                    } else {
                      optStyle = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      disabled={hasAnswered}
                      onClick={() => handleSelectOption(oIdx)}
                      className={`w-full text-left p-3 rounded-xl border text-xs flex items-start gap-3 transition-all duration-150 ${optStyle}`}
                    >
                      <span className="w-5 h-5 rounded-full flex items-center justify-center border font-bold text-[10px] shrink-0 mt-0.5">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="flex-1 leading-relaxed">{opt}</span>
                      {hasAnswered && oIdx === currentQ.correctAnswer && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                      {hasAnswered && oIdx === userAns && oIdx !== currentQ.correctAnswer && (
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation box */}
              {hasAnswered && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 animate-in fade-in duration-200">
                  <span className="font-bold block text-blue-900 mb-1">💡 Lời giải chi tiết:</span>
                  <p className="leading-relaxed">{currentQ.explanation}</p>
                </div>
              )}

              {/* Next Button */}
              {hasAnswered && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
                  >
                    <span>{currentIdx < BIOLOGY_QUIZ_QUESTIONS.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-2xl shadow-inner">
                <Trophy className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Hoàn thành bài tập!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Bạn trả lời đúng <span className="font-bold text-blue-600 text-sm">{correctCount}</span> / {BIOLOGY_QUIZ_QUESTIONS.length} câu.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-sm mx-auto text-xs text-slate-600">
                {correctCount === 5 ? (
                  <p className="text-emerald-700 font-bold">Xuất sắc! Bạn đã nắm vững toàn bộ kiến thức về kích thước tế bào và sinh học 10.</p>
                ) : correctCount >= 3 ? (
                  <p className="text-blue-700 font-semibold">Làm rất tốt! Bạn đã hiểu phần lớn các kiến thức trọng tâm.</p>
                ) : (
                  <p className="text-amber-700">Hãy xem lại mô hình 3D và bảng tra cứu kích thước để đạt điểm cao hơn nhé!</p>
                )}
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={handleRestart}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Làm lại bài tập</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  Quay lại mô hình 3D
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
