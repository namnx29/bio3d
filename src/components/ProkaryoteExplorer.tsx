import React, { useState } from 'react';
import { BACTERIA_ANATOMY_PARTS } from '../data/biologyData';
import { Layers, Info, Check, Shield, Activity, Dna } from 'lucide-react';

interface ProkaryoteExplorerProps {
  onBackToScale: () => void;
}

export const ProkaryoteExplorer: React.FC<ProkaryoteExplorerProps> = ({ onBackToScale }) => {
  const [selectedPartId, setSelectedPartId] = useState<string>('nucleoid');

  const selectedPart = BACTERIA_ANATOMY_PARTS.find(p => p.id === selectedPartId) || BACTERIA_ANATOMY_PARTS[0];

  return (
    <div className="absolute inset-x-4 top-16 bottom-16 z-20 pointer-events-none flex items-start justify-between gap-4">
      {/* Left Anatomy Navigator Panel */}
      <div className="w-80 max-h-full bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 p-4 pointer-events-auto flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
          <Layers className="w-4 h-4 text-blue-600" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Các thành phần cấu tạo tế bào vi khuẩn
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {BACTERIA_ANATOMY_PARTS.map(part => {
            const isSelected = part.id === selectedPartId;
            return (
              <button
                key={part.id}
                onClick={() => setSelectedPartId(part.id)}
                className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: part.color }}
                  />
                  <span className="truncate">{part.name}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
            );
          })}
        </div>

        <div className="pt-3 mt-2 border-t border-slate-200">
          <button
            onClick={onBackToScale}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            ← Quay lại Thang đo kích thước tổng quan
          </button>
        </div>
      </div>

      {/* Right Anatomy Detail Card */}
      <div className="w-96 max-h-full bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 p-5 pointer-events-auto flex flex-col space-y-3 animate-in fade-in slide-in-from-right-4 duration-200">
        <div className="flex items-start justify-between">
          <div>
            <span
              className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white mb-1.5"
              style={{ backgroundColor: selectedPart.color }}
            >
              {selectedPart.role}
            </span>
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              {selectedPart.name}
            </h3>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
          {selectedPart.description}
        </p>

        {/* Biological significance box */}
        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-1">
          <span className="font-bold flex items-center gap-1.5 text-blue-950">
            <Info className="w-3.5 h-3.5 text-blue-600" />
            <span>Ý nghĩa trong Sinh học 10 & Y học:</span>
          </span>
          {selectedPart.id === 'cell_wall' && (
            <p className="text-blue-800">
              Là đích tác động của kháng sinh nhóm Penicillin (ức chế tổng hợp peptidoglycan khiến vi khuẩn bị vỡ dưới áp suất thẩm thấu). Tế bào người không có thành tế bào nên không bị kháng sinh tiêu diệt!
            </p>
          )}
          {selectedPart.id === 'nucleoid' && (
            <p className="text-blue-800">
              Không có màng nhân nên quá trình phiên mã và dịch mã diễn ra đồng thời trong tế bào chất, giúp vi khuẩn tổng hợp protein cực nhanh và thích ứng tức thời.
            </p>
          )}
          {selectedPart.id === 'plasmid' && (
            <p className="text-blue-800">
              Chứa gen kháng thuốc kháng sinh. Được ứng dụng phổ biến làm thể truyền (vector) trong công nghệ gen tái tổ hợp để sản xuất Insulin, vaccine.
            </p>
          )}
          {selectedPart.id === 'ribosome' && (
            <p className="text-blue-800">
              Ribosome 70S có cấu trúc khác với ribosome 80S của tế bào người, là mục tiêu của các kháng sinh như Streptomycin, Tetracycline (ức chế tổng hợp protein của vi khuẩn mà không hại tế bào người).
            </p>
          )}
          {selectedPart.id === 'capsule' && (
            <p className="text-blue-800">
              Giúp vi khuẩn né tránh hệ miễn dịch và sự thực bào của bạch cầu trong cơ thể vật chủ, làm tăng độc lực gây bệnh của vi khuẩn.
            </p>
          )}
          {selectedPart.id === 'flagellum' && (
            <p className="text-blue-800">
              Giúp vi khuẩn bơi ngược hoặc xuôi dòng gradient hóa học (hướng hóa) để tìm nguồn thức ăn hoặc tránh các chất độc hại.
            </p>
          )}
          {selectedPart.id === 'pili' && (
            <p className="text-blue-800">
              Lông tiếp hợp (Sex pili) cho phép hai vi khuẩn liên kết với nhau để trao đổi plasmid, giải thích cơ chế lây lan tính kháng kháng sinh giữa các chủng vi khuẩn.
            </p>
          )}
          {selectedPart.id === 'plasma_membrane' && (
            <p className="text-blue-800">
              Vì không có ty thể, các enzyme của chuỗi chuyền electron hô hấp tế bào ở vi khuẩn được định vị ngay trên màng sinh chất và các nếp gấp mesosome.
            </p>
          )}
          {selectedPart.id === 'cytoplasm' && (
            <p className="text-blue-800">
              Chiếm phần lớn thể tích tế bào, là nơi diễn ra các phản ứng sinh hóa chuyển hóa vật chất và năng lượng duy trì sự sống.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
