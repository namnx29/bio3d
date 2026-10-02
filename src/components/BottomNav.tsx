import React from 'react';
import { ActiveModule } from '../types/biology';

interface BottomNavProps {
  activeModule: ActiveModule;
  onSelectModule: (module: ActiveModule) => void;
}

const MODULES: { id: ActiveModule; num: string; title: string }[] = [
  {
    id: '01_scale',
    num: '01',
    title: 'Kích thước của một số loại tế bào và cấp độ tế bào'
  },
  {
    id: '02_bacteria',
    num: '02',
    title: 'Vi khuẩn'
  },
  {
    id: '03_prokaryote_structure',
    num: '03',
    title: 'Cấu tạo tế bào nhân...'
  },
  {
    id: '04_compare',
    num: '04',
    title: 'So sánh tế bào nhân...'
  },
  {
    id: '05_cell_wall',
    num: '05',
    title: 'Thành tế bào và...'
  }
];

export const BottomNav: React.FC<BottomNavProps> = ({
  activeModule,
  onSelectModule
}) => {
  return (
    <footer className="absolute bottom-0 left-0 right-0 z-20 bg-white border-t border-slate-200/90 shadow-lg px-4 py-2 flex items-center justify-between">
      {/* Left: Version tag matching screenshot */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono pl-1">
        <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
        <span>v0.43.1</span>
      </div>

      {/* Center: Module selector tabs */}
      <nav className="flex items-center gap-2 overflow-x-auto max-w-[75vw] py-0.5 no-scrollbar">
        {MODULES.map(mod => {
          const isActive = activeModule === mod.id;

          return (
            <button
              key={mod.id}
              onClick={() => onSelectModule(mod.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[#1e3a8a] text-white shadow-md'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/70 hover:border-slate-300'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {mod.num}
              </span>
              <span className="truncate max-w-[220px]">{mod.title}</span>
            </button>
          );
        })}
      </nav>

      {/* Right: Onluyen logo branding matching screenshot */}
      <div className="flex items-center gap-1.5 pr-2 select-none">
      </div>
    </footer>
  );
};
