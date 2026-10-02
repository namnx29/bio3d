import React from 'react';
import { BioEntity } from '../types/biology';
import { X, Volume2, Sparkles, Microscope, Ruler, BookOpen, Layers } from 'lucide-react';

interface InfoDrawerProps {
  entity: BioEntity | null;
  isOpen: boolean;
  onClose: () => void;
  onSpeak: (text: string) => void;
  isSpeaking: boolean;
}

export const InfoDrawer: React.FC<InfoDrawerProps> = ({
  entity,
  isOpen,
  onClose,
  onSpeak,
  isSpeaking
}) => {
  if (!isOpen || !entity) return null;

  const handleReadAloud = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const textToSpeak = `${entity.vietnameseName}. Kích thước: ${entity.dimensions}. ${entity.summary}. ${entity.description}. Quan sát bằng: ${entity.microscopeLabel}.`;
    onSpeak(textToSpeak);
  };

  return (
    <div className="absolute right-4 top-16 bottom-16 w-96 max-w-[calc(100vw-2rem)] z-30 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col animate-in fade-in slide-in-from-right-8 duration-200">
      {/* Drawer Header */}
      <div className="relative px-5 py-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm font-bold text-sm"
            style={{ backgroundColor: entity.color }}
          >
            {entity.vietnameseName.charAt(0)}
          </div>
          <div>
            <h2 className="text-base font-bold leading-tight">{entity.vietnameseName}</h2>
            <p className="text-xs text-blue-200">{entity.name} · {entity.scaleLabel}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleReadAloud}
            className={`p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-all ${
              isSpeaking ? 'bg-emerald-500/80 text-white animate-pulse' : ''
            }`}
            title="Đọc thuyết minh giọng nói tiếng Việt"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-all"
            title="Đóng thông tin"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 text-slate-700 text-sm">
        {/* Metric & Microscope Cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Ruler className="w-3.5 h-3.5 text-blue-600" />
              <span>Kích thước</span>
            </div>
            <span className="text-base font-bold text-slate-900">{entity.dimensions}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Microscope className="w-3.5 h-3.5 text-indigo-600" />
              <span>Thiết bị soi</span>
            </div>
            <span className="text-xs font-semibold text-slate-900 line-clamp-2">
              {entity.microscopeLabel}
            </span>
          </div>
        </div>

        {/* Short Summary */}
        <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-blue-900 leading-relaxed text-xs">
          <span className="font-semibold block mb-1">Tóm lược sinh học:</span>
          {entity.summary}
        </div>

        {/* Detailed Explanation */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Mô tả chi tiết cấu trúc</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
            {entity.description}
          </p>
        </div>

        {/* 3D Ribbon Color Legend for Protein */}
        {entity.id === 'protein' && (
          <div className="p-3.5 rounded-xl bg-slate-900 text-white border border-slate-700/80 shadow-inner space-y-2">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>🎨 Chú giải mô hình 3D Ribbon (PDB: 1E7H)</span>
            </div>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex items-center gap-2.5 bg-slate-800/80 p-2 rounded-lg border border-red-500/30">
                <span className="w-3.5 h-3.5 rounded-full bg-red-600 shrink-0 shadow-sm shadow-red-500/50" />
                <div>
                  <span className="font-bold text-red-300">Dải xoắn Alpha (α-helix):</span>
                  <span className="text-slate-300 text-[11px] block">Ruy băng xoắn ốc 3D đỏ rực (chiếm ~67% cấu trúc HSA)</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-800/80 p-2 rounded-lg border border-emerald-500/30">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shrink-0 shadow-sm shadow-emerald-500/50" />
                <div>
                  <span className="font-bold text-emerald-300">Đoạn uốn liên kết (Loops/Turns):</span>
                  <span className="text-slate-300 text-[11px] block">Ống xanh lá mềm dẻo nối giữa các đoạn xoắn (~23%)</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-800/80 p-2 rounded-lg border border-slate-400/30">
                <span className="w-3.5 h-3.5 rounded-full bg-slate-100 border border-slate-300 shrink-0 shadow-sm" />
                <div>
                  <span className="font-bold text-slate-100">Axit béo liên kết (Ligands):</span>
                  <span className="text-slate-300 text-[11px] block">Hạt cầu CPK trắng ngọc nằm sâu trong các khe kỵ nước</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3D Structure Legend for Bacteria */}
        {entity.id === 'bacteria' && (
          <div className="p-3.5 rounded-xl bg-slate-900 text-white border border-slate-700/80 shadow-inner space-y-2">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>🔬 Chú giải cấu tạo tế bào vi khuẩn 3D</span>
            </div>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex items-center gap-2.5 bg-slate-800/80 p-2 rounded-lg border border-sky-500/30">
                <span className="w-3.5 h-3.5 rounded-full bg-sky-400 shrink-0 shadow-sm shadow-sky-400/50" />
                <div>
                  <span className="font-bold text-sky-300">Vỏ nhầy (Capsule):</span>
                  <span className="text-slate-300 text-[11px] block">Lớp vỏ ngoài xanh lam trong suốt bảo vệ vi khuẩn khỏi thực bào</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-800/80 p-2 rounded-lg border border-emerald-500/30">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shrink-0 shadow-sm shadow-emerald-500/50" />
                <div>
                  <span className="font-bold text-emerald-300">Thành Peptidoglycan & Màng sinh chất:</span>
                  <span className="text-slate-300 text-[11px] block">Thành xanh lục giữ khung cơ học, màng vàng điều hòa thẩm thấu</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-800/80 p-2 rounded-lg border border-purple-500/30">
                <span className="w-3.5 h-3.5 rounded-full bg-purple-500 shrink-0 shadow-sm shadow-purple-500/50" />
                <div>
                  <span className="font-bold text-purple-300">ADN vùng nhân (Nucleoid) & Plasmid:</span>
                  <span className="text-slate-300 text-[11px] block">Chuỗi ADN xoắn kép siêu cuộn màu tím phát sáng và vòng plasmid nhỏ</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-800/80 p-2 rounded-lg border border-orange-500/30">
                <span className="w-3.5 h-3.5 rounded-full bg-orange-500 shrink-0 shadow-sm" />
                <div>
                  <span className="font-bold text-orange-300">Ribosome 70S:</span>
                  <span className="text-slate-300 text-[11px] block">Hàng chục hạt màu cam phân bố trong tế bào chất tổng hợp protein</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-800/80 p-2 rounded-lg border border-blue-500/30">
                <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 shrink-0 shadow-sm" />
                <div>
                  <span className="font-bold text-cyan-300">Roi cực (Flagella) & Lông nhung (Pili):</span>
                  <span className="text-slate-300 text-[11px] block">Chùm roi cắm thể gốc xoắn sóng bơi lội và hệ lông nhung bám dày đặc</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3D Structure Legend for Chloroplast */}
        {entity.id === 'chloroplast' && (
          <div className="p-3.5 rounded-xl bg-slate-900 text-white border border-slate-700/80 shadow-inner space-y-2">
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>🌿 Chú giải cấu trúc lục lạp 3D (Chloroplast)</span>
            </div>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex items-center gap-2.5 bg-slate-800/80 p-2 rounded-lg border border-lime-500/30">
                <span className="w-3.5 h-3.5 rounded-full bg-lime-400 shrink-0 shadow-sm shadow-lime-400/50" />
                <div>
                  <span className="font-bold text-lime-300">Mép cắt màng kép (Double Membrane Rim):</span>
                  <span className="text-slate-300 text-[11px] block">Màng ngoài xanh thẫm và viền mép kép màu xanh nõn chuối viền vàng</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-800/80 p-2 rounded-lg border border-emerald-500/30">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shrink-0 shadow-sm shadow-emerald-500/50" />
                <div>
                  <span className="font-bold text-emerald-300">Các hạt Grana & Túi Thylakoid:</span>
                  <span className="text-slate-300 text-[11px] block">9 cột đĩa thylakoid tròn dẹp màu xanh diệp lục xếp chồng thực hiện quang hợp</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-800/80 p-2 rounded-lg border border-green-600/30">
                <span className="w-3.5 h-3.5 rounded-full bg-green-600 shrink-0 shadow-sm" />
                <div>
                  <span className="font-bold text-green-300">Cầu thylakoid cơ chất (Stromal Lamellae):</span>
                  <span className="text-slate-300 text-[11px] block">Hệ thống ống và cầu nối màng liên kết giữa các hạt Grana với nhau</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-800/80 p-2 rounded-lg border border-yellow-500/30">
                <span className="w-3.5 h-3.5 rounded-full bg-yellow-400 shrink-0 shadow-sm" />
                <div>
                  <span className="font-bold text-yellow-300">Chất nền Stroma & ADN, Ribosome riêng:</span>
                  <span className="text-slate-300 text-[11px] block">Khoang chứa dịch dạng keo, nơi diễn ra pha tối và chứa vòng ADN lục lạp</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3D Structure Legend for Animal Cell (Sketchfab Model) */}
        {entity.id === 'animal_cell' && (
          <div className="p-3.5 rounded-xl bg-slate-900 text-white border border-slate-700/80 shadow-inner space-y-2">
            <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>🧬 Chú giải mô hình tế bào động vật 3D (Sketchfab)</span>
            </div>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex items-center gap-2.5 bg-slate-800/80 p-2 rounded-lg border border-pink-500/30">
                <span className="w-5 h-5 rounded-full bg-pink-500/30 border border-pink-400 text-pink-300 font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                <div>
                  <span className="font-bold text-pink-300">Dịch nhân (Nucleoplasm):</span>
                  <span className="text-slate-300 text-[11px] block">Dịch keo trong nhân chứa chất nhiễm sắc (ADN liên kết histon)</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-800/80 p-2 rounded-lg border border-blue-500/30">
                <span className="w-5 h-5 rounded-full bg-blue-500/30 border border-blue-400 text-blue-300 font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                <div>
                  <span className="font-bold text-blue-300">Nhân con (Nucleolus):</span>
                  <span className="text-slate-300 text-[11px] block">Thể đậm đặc màu xanh lam tổng hợp rARN và tiểu phần ribosome</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-800/80 p-2 rounded-lg border border-indigo-500/30">
                <span className="w-5 h-5 rounded-full bg-indigo-500/30 border border-indigo-400 text-indigo-300 font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                <div>
                  <span className="font-bold text-indigo-300">Lưới nội chất hạt (Rough ER):</span>
                  <span className="text-slate-300 text-[11px] block">Hệ màng gấp nếp chàm đính dày đặc ribosome hồng tổng hợp protein</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-800/80 p-2 rounded-lg border border-red-500/30">
                <span className="w-5 h-5 rounded-full bg-red-500/30 border border-red-400 text-red-300 font-bold text-[11px] flex items-center justify-center shrink-0">4</span>
                <div>
                  <span className="font-bold text-red-300">Bộ máy Golgi:</span>
                  <span className="text-slate-300 text-[11px] block">Túi dẹp đỏ uốn cong phân loại, chế biến và tiết sản phẩm</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-800/80 p-2 rounded-lg border border-orange-500/30">
                <span className="w-5 h-5 rounded-full bg-orange-500/30 border border-orange-400 text-orange-300 font-bold text-[11px] flex items-center justify-center shrink-0">5</span>
                <div>
                  <span className="font-bold text-orange-300">Ty thể (Mitochondrion):</span>
                  <span className="text-slate-300 text-[11px] block">Nhà máy năng lượng tế bào với mào cristae gấp nếp màu cam</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-800/80 p-2 rounded-lg border border-purple-500/30">
                <span className="w-5 h-5 rounded-full bg-purple-500/30 border border-purple-400 text-purple-300 font-bold text-[11px] flex items-center justify-center shrink-0">6</span>
                <div>
                  <span className="font-bold text-purple-300">Lưới nội chất trơn (Smooth ER):</span>
                  <span className="text-slate-300 text-[11px] block">Hệ thống ống thông nhau màu tím tổng hợp lipid và giải độc</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3D Structure Legend for Plant Cell */}
        {entity.id === 'plant_cell' && (
          <div className="p-3.5 rounded-xl bg-slate-900 text-white border border-slate-700/80 shadow-inner space-y-2">
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>🌱 Chú giải mô hình tế bào thực vật 3D (Sinh học 10)</span>
            </div>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex items-center gap-2.5 bg-slate-800/80 p-2 rounded-lg border border-emerald-500/30">
                <span className="w-5 h-5 rounded-full bg-emerald-500/30 border border-emerald-400 text-emerald-300 font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                <div>
                  <span className="font-bold text-emerald-300">Thành Xenlulôzơ & Cầu sinh chất (Plasmodesmata):</span>
                  <span className="text-slate-300 text-[11px] block">Vách dày xanh ngọc cắt mép vàng chanh; kênh liên bào cam xuyên thành</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-800/80 p-2 rounded-lg border border-sky-500/30">
                <span className="w-5 h-5 rounded-full bg-sky-500/30 border border-sky-400 text-sky-300 font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                <div>
                  <span className="font-bold text-sky-300">Không bào trung tâm khổng lồ (Central Vacuole):</span>
                  <span className="text-slate-300 text-[11px] block">Khối cầu xanh lam thủy tinh trong suốt chiếm 60 - 80% thể tích, có màng Tonoplast</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-800/80 p-2 rounded-lg border border-lime-500/30">
                <span className="w-5 h-5 rounded-full bg-lime-500/30 border border-lime-400 text-lime-300 font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                <div>
                  <span className="font-bold text-lime-300">Lục lạp (Chloroplasts):</span>
                  <span className="text-slate-300 text-[11px] block">5 bào quan quang hợp xanh lục rìa tế bào, bổ cắt lộ cột hạt Grana thylakoid</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-800/80 p-2 rounded-lg border border-purple-500/30">
                <span className="w-5 h-5 rounded-full bg-purple-500/30 border border-purple-400 text-purple-300 font-bold text-[11px] flex items-center justify-center shrink-0">4</span>
                <div>
                  <span className="font-bold text-purple-300">Nhân tế bào lệch tâm (Nucleus & Nucleolus):</span>
                  <span className="text-slate-300 text-[11px] block">Bị không bào ép dạt vào góc; màng kép tím có lỗ nhân, dịch hồng và nhân con xanh</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-800/80 p-2 rounded-lg border border-indigo-500/30">
                <span className="w-5 h-5 rounded-full bg-indigo-500/30 border border-indigo-400 text-indigo-300 font-bold text-[11px] flex items-center justify-center shrink-0">5</span>
                <div>
                  <span className="font-bold text-indigo-300">Lưới nội chất (RER & SER):</span>
                  <span className="text-slate-300 text-[11px] block">Lưới có hạt chàm ôm sát nhân đính ribosome hồng và hệ ống trơn tím</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-800/80 p-2 rounded-lg border border-red-500/30">
                <span className="w-5 h-5 rounded-full bg-red-500/30 border border-red-400 text-red-300 font-bold text-[11px] flex items-center justify-center shrink-0">6</span>
                <div>
                  <span className="font-bold text-red-300">Ty thể (Mitochondria):</span>
                  <span className="text-slate-300 text-[11px] block">Thể hình xúc xích vỏ đỏ thẫm bổ cắt lộ nếp gấp mào cristae vàng cam</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-800/80 p-2 rounded-lg border border-amber-500/30">
                <span className="w-5 h-5 rounded-full bg-amber-500/30 border border-amber-400 text-amber-300 font-bold text-[11px] flex items-center justify-center shrink-0">7</span>
                <div>
                  <span className="font-bold text-amber-300">Bộ máy Golgi / Dictyosome:</span>
                  <span className="text-slate-300 text-[11px] block">Xếp túi dẹp cong màu vàng cam tổng hợp pectin và cellulose tạo vách</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Key Features */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Đặc điểm sinh học nổi bật</span>
          </h3>
          <ul className="space-y-1.5">
            {entity.keyFeatures.map((feat, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Curriculum Reference */}
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-2 text-amber-900 text-xs">
          <BookOpen className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Kiến thức trọng tâm:</span>
            <span>{entity.curriculumNotes}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
