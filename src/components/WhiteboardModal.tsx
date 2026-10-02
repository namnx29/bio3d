import React, { useState } from 'react';
import { X, BookOpen, Layers, CheckSquare, Plus, Trash2, Download } from 'lucide-react';

interface WhiteboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhiteboardModal: React.FC<WhiteboardModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'sv_ratio' | 'notes'>('summary');
  const [userNotes, setUserNotes] = useState<string[]>([
    'Tế bào nhân sơ có tỉ lệ S/V lớn => trao đổi chất nhanh, sinh sản nhanh.',
    'Kính hiển vi quang học chỉ soi được vật thể > 200 nm (0.2 µm).',
    'Virus (~100 nm) và Protein (~10 nm) bắt buộc phải dùng kính hiển vi điện tử.'
  ]);
  const [newNote, setNewNote] = useState('');

  if (!isOpen) return null;

  const handleAddNote = () => {
    if (newNote.trim()) {
      setUserNotes([...userNotes, newNote.trim()]);
      setNewNote('');
    }
  };

  const handleDeleteNote = (idx: number) => {
    setUserNotes(userNotes.filter((_, i) => i !== idx));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              📝
            </div>
            <div>
              <h2 className="text-lg font-bold">Bảng trắng Giảng dạy & Tổng hợp Lý thuyết</h2>
              <p className="text-xs text-blue-200">Sinh học 10 · Tế bào nhân sơ & Thang đo cấp độ sinh học</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50">
          <button
            onClick={() => setActiveTab('summary')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'summary'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Bảng đối chiếu kích thước & Thiết bị quan sát</span>
          </button>

          <button
            onClick={() => setActiveTab('sv_ratio')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'sv_ratio'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Ý nghĩa sinh học tỉ lệ S/V</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'notes'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Ghi chú bài học ({userNotes.length})</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 text-sm text-slate-700">
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Cấp độ tổ chức</th>
                      <th className="p-3">Kích thước</th>
                      <th className="p-3">Ví dụ tiêu biểu</th>
                      <th className="p-3">Thiết bị quan sát</th>
                      <th className="p-3">Giới hạn quang học</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-purple-700">Nguyên tử</td>
                      <td className="p-3 font-mono">0,1 nm (10⁻¹⁰ m)</td>
                      <td className="p-3">Nguyên tử C, H, O, N, P, S</td>
                      <td className="p-3 font-medium text-pink-600">Kính hiển vi điện tử (STM/TEM)</td>
                      <td className="p-3 text-slate-500">Dưới giới hạn quang học</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-rose-700">Phân tử nhỏ</td>
                      <td className="p-3 font-mono">1 nm (10⁻⁹ m)</td>
                      <td className="p-3">Amino acid, đường glucose, lipid</td>
                      <td className="p-3 font-medium text-pink-600">Kính hiển vi điện tử / Tinh thể học</td>
                      <td className="p-3 text-slate-500">Dưới giới hạn quang học</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-green-700">Đại phân tử</td>
                      <td className="p-3 font-mono">5 - 10 nm</td>
                      <td className="p-3">Protein (enzyme, kháng thể), ADN, ARN</td>
                      <td className="p-3 font-medium text-pink-600">Cryo-EM / Kính hiển vi điện tử</td>
                      <td className="p-3 text-slate-500">Dưới giới hạn quang học</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-emerald-700">Virus</td>
                      <td className="p-3 font-mono">20 - 100 nm</td>
                      <td className="p-3">SARS-CoV-2, HIV, Phage T4, Cúm</td>
                      <td className="p-3 font-medium text-pink-600">Kính hiển vi điện tử (TEM/SEM)</td>
                      <td className="p-3 text-slate-500">Dưới giới hạn quang học</td>
                    </tr>
                    <tr className="hover:bg-slate-50 bg-blue-50/50">
                      <td className="p-3 font-semibold text-blue-700">Tế bào nhân sơ</td>
                      <td className="p-3 font-mono font-bold">1 - 3 µm (10⁻⁶ m)</td>
                      <td className="p-3 font-medium">Vi khuẩn E. coli, Vi khuẩn lactic</td>
                      <td className="p-3 font-medium text-amber-600">Kính hiển vi quang học (vật kính 100x dầu)</td>
                      <td className="p-3 text-emerald-600 font-semibold">Trên giới hạn quang học</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-amber-700">Bào quan & Tế bào nhân thực</td>
                      <td className="p-3 font-mono">10 - 30 µm</td>
                      <td className="p-3">Tế bào động vật, thực vật, lục lạp, ty thể</td>
                      <td className="p-3 font-medium text-amber-600">Kính hiển vi quang học</td>
                      <td className="p-3 text-emerald-600 font-semibold">Dễ dàng quan sát rõ</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-indigo-700">Tế bào cỡ lớn</td>
                      <td className="p-3 font-mono">100 µm (0,1 mm)</td>
                      <td className="p-3">Tế bào trứng người (Noãn cầu)</td>
                      <td className="p-3 font-medium text-amber-600">Kính hiển vi quang học / Chạm ngưỡng mắt thường</td>
                      <td className="p-3 text-emerald-600 font-semibold">Nhìn thấy như chấm bụi mờ</td>
                    </tr>
                    <tr className="hover:bg-slate-50 bg-amber-50/50">
                      <td className="p-3 font-semibold text-slate-900">Tế bào khổng lồ</td>
                      <td className="p-3 font-mono font-bold">1 - 2 mm (1000 µm)</td>
                      <td className="p-3 font-medium">Tế bào trứng ếch, trứng chim đà điểu</td>
                      <td className="p-3 font-bold text-slate-800">Mắt thường (Không cần kính)</td>
                      <td className="p-3 text-blue-600 font-semibold">Quan sát trực tiếp</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <span className="font-bold text-slate-800">Ghi nhớ quy đổi đơn vị:</span> 1 mm = 1.000 µm = 1.000.000 nm = 10.000.000 Ångström.
              </div>
            </div>
          )}

          {activeTab === 'sv_ratio' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <h3 className="text-sm font-bold text-blue-900 mb-2">
                  Tỉ lệ Diện tích bề mặt / Thể tích (S/V) và Kích thước tế bào
                </h3>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Đối với hình cầu bán kính <span className="font-mono font-bold">R</span>:
                  <br />
                  - Diện tích bề mặt: <span className="font-mono font-bold">S = 4πR²</span>
                  <br />
                  - Thể tích: <span className="font-mono font-bold">V = (4/3)πR³</span>
                  <br />
                  - Tỉ lệ: <span className="font-mono font-bold text-blue-950 text-sm">S / V = 3 / R</span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <h4 className="font-bold text-emerald-900 text-xs mb-1.5">Ưu thế của vi khuẩn (R nhỏ):</h4>
                  <ul className="text-xs text-emerald-800 space-y-1 list-disc list-inside">
                    <li>Tỉ lệ <span className="font-bold">S/V cực lớn</span>.</li>
                    <li>Tốc độ trao đổi chất với môi trường cực kỳ nhanh.</li>
                    <li>Tiêu thụ dinh dưỡng và đào thải chất thải tức thì.</li>
                    <li>Sinh trưởng và phân chia tế bào thần tốc (chỉ 20 phút/thế hệ ở E. coli).</li>
                  </ul>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <h4 className="font-bold text-amber-900 text-xs mb-1.5">Hạn chế khi tế bào quá lớn:</h4>
                  <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                    <li>Tỉ lệ <span className="font-bold">S/V giảm mạnh</span>.</li>
                    <li>Khuếch tán chất từ màng vào trung tâm mất nhiều thời gian.</li>
                    <li>Đòi hỏi tế bào nhân thực phải có hệ thống nội màng, khung xương và các bào quan vận chuyển chủ động.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                  placeholder="Nhập ghi chú mới của bạn về bài học..."
                  className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddNote}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm</span>
                </button>
              </div>

              <div className="space-y-2">
                {userNotes.map((note, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                  >
                    <span>{note}</span>
                    <button
                      onClick={() => handleDeleteNote(idx)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                      title="Xóa ghi chú"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
