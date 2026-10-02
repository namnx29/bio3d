import React, { useState } from 'react';
import { Layers, ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react';

interface CellWallExplorerProps {
  onBackToScale: () => void;
}

export const CellWallExplorer: React.FC<CellWallExplorerProps> = ({ onBackToScale }) => {
  const [gramType, setGramType] = useState<'gram_pos' | 'gram_neg'>('gram_pos');

  return (
    <div className="absolute inset-x-4 top-16 bottom-16 z-20 pointer-events-none flex flex-col items-center justify-between">
      <div className="w-full max-w-4xl bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200 p-6 pointer-events-auto flex flex-col space-y-4 max-h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Thành tế bào Peptidoglycan & Phân biệt Vi khuẩn Gram Dương / Gram Âm
            </h2>
            <p className="text-xs text-slate-500">
              Sinh học 10 · Phương pháp nhuộm Gram kinh điển của Christian Gram (1884)
            </p>
          </div>
          <button
            onClick={onBackToScale}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            ← Về Thang đo 3D
          </button>
        </div>

        {/* Gram Selector Tabs */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setGramType('gram_pos')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              gramType === 'gram_pos'
                ? 'bg-purple-600 text-white border-purple-500 shadow-md ring-2 ring-purple-300'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Vi khuẩn Gram Dương (Gram +)</span>
              <span className="w-3.5 h-3.5 rounded-full bg-purple-400" />
            </div>
            <p className={`text-xs ${gramType === 'gram_pos' ? 'text-purple-100' : 'text-purple-700'}`}>
              Vách Peptidoglycan dày (20 - 80 nm), bắt màu Tím khi nhuộm Gram
            </p>
          </button>

          <button
            onClick={() => setGramType('gram_neg')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              gramType === 'gram_neg'
                ? 'bg-rose-600 text-white border-rose-500 shadow-md ring-2 ring-rose-300'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-900 border-rose-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Vi khuẩn Gram Âm (Gram -)</span>
              <span className="w-3.5 h-3.5 rounded-full bg-rose-400" />
            </div>
            <p className={`text-xs ${gramType === 'gram_neg' ? 'text-rose-100' : 'text-rose-700'}`}>
              Vách Peptidoglycan mỏng (2 - 7 nm) + có Màng Ngoài (LPS), bắt màu Đỏ/Hồng
            </p>
          </button>
        </div>

        {/* Structural Details Display */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {gramType === 'gram_pos' ? (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2">
                <h3 className="text-sm font-bold text-purple-950 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Cấu tạo thành tế bào Vi khuẩn Gram Dương</span>
                </h3>
                <p className="text-xs text-purple-900 leading-relaxed">
                  Bao gồm một lớp peptidoglycan rất dày (gồm nhiều lớp polysaccharide lồng ghép liên kết chéo qua cầu nối peptit), xen kẽ với axit teichoic và axit lipoteichoic xuyên qua neo vào màng sinh chất.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-slate-800">Khả năng bắt màu:</span>
                  <p className="text-slate-600">Giữ chặt phức hợp thuốc nhuộm Tím Tinh Thể - Iod (Crystal Violet - Iodine) khi tẩy cồn, vi khuẩn có màu Tím sẫm dưới kính hiển vi.</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-slate-800">Độ nhạy kháng sinh:</span>
                  <p className="text-emerald-700 font-semibold">Rất nhạy cảm với Penicillin và Lysozyme nước bọt/nước mắt vì kháng sinh dễ dàng tiếp cận và phá hủy vách peptidoglycan lộ bên ngoài.</p>
                </div>
              </div>

              <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700">
                <span className="font-bold">Đại diện thường gặp:</span> Tụ cầu khuẩn (<em>Staphylococcus</em>), Liên cầu khuẩn (<em>Streptococcus</em>), Trực khuẩn than (<em>Bacillus anthracis</em>), Vi khuẩn Lactic lên men sữa chua.
              </div>
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-2">
                <h3 className="text-sm font-bold text-rose-950 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Cấu tạo thành tế bào Vi khuẩn Gram Âm</span>
                </h3>
                <p className="text-xs text-rose-900 leading-relaxed">
                  Lớp peptidoglycan rất mỏng nằm trong khoang chu chất (periplasmic space). Bên ngoài có thêm một lớp Màng Ngoài (Outer Membrane) độc đáo chứa phức hợp Lipopolysaccharide (LPS).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-slate-800">Khả năng bắt màu:</span>
                  <p className="text-slate-600">Vách mỏng bị cồn hòa tan lipid màng ngoài làm trôi màu tím, sau đó bắt màu đỏ hồng của thuốc nhuộm bổ sung Safranin.</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-slate-800">Độc lực & Đề kháng:</span>
                  <p className="text-rose-700 font-semibold">LPS hoạt động như nội độc tố (Endotoxin) gây sốt cao và sốc nhiễm khuẩn. Màng ngoài ngăn chặn Penicillin và nhiều hóa chất xâm nhập, làm tăng độ kháng thuốc.</p>
                </div>
              </div>

              <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700">
                <span className="font-bold">Đại diện thường gặp:</span> Trực khuẩn đường ruột (<em>Escherichia coli</em>), Phẩy khuẩn tả (<em>Vibrio cholerae</em>), Trực khuẩn mủ xanh (<em>Pseudomonas aeruginosa</em>), Vi khuẩn thương hàn (<em>Salmonella</em>).
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
