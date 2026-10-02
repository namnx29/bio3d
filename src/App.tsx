import React, { useState, useCallback, useRef, useEffect } from 'react';
import { BIO_ENTITIES, PROKARYOTE_STRUCTURES } from './data/biologyData';
import { BioEntity, ActiveModule, ProkaryoteStructureDetail, ProkaryoteStructureId } from './types/biology';
import { ThreeCanvas } from './components/ThreeCanvas';
import { BacteriaMorphology3D } from './components/BacteriaMorphology3D';
import { Prokaryote3DModel } from './components/Prokaryote3DModel';
import { StructureInspectionCard } from './components/StructureInspectionCard';
import { StudentTasksModal } from './components/StudentTasksModal';
import { TeacherModePanel } from './components/TeacherModePanel';
import { TopHeader } from './components/TopHeader';
import { BottomNav } from './components/BottomNav';
import { RightToolbar } from './components/RightToolbar';
import { InfoDrawer } from './components/InfoDrawer';
import { DrawingOverlay } from './components/DrawingOverlay';
import { WhiteboardModal } from './components/WhiteboardModal';
import { QuizModal } from './components/QuizModal';
import { ComparisonView } from './components/ComparisonView';
import { CellWallExplorer } from './components/CellWallExplorer';
import { vietnameseAudio } from './utils/vietnameseAudio';
import { ChevronRight, ChevronLeft, Sparkles, GraduationCap } from 'lucide-react';

export default function App() {
  // Scale view state
  const [selectedEntity, setSelectedEntity] = useState<BioEntity | null>(null);
  const [sliderPos, setSliderPos] = useState<number>(0);

  // Prokaryote 3D detailed model state
  const [selectedStructure, setSelectedStructure] = useState<ProkaryoteStructureDetail | null>(null);
  const [lastClicked3DId, setLastClicked3DId] = useState<ProkaryoteStructureId | null>(null);
  const [isTasksOpen, setIsTasksOpen] = useState<boolean>(false);
  const [isTeacherMode, setIsTeacherMode] = useState<boolean>(false);

  // Global tools state
  const [isDrawingActive, setIsDrawingActive] = useState<boolean>(false);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState<boolean>(false);
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);
  const [lightingMode, setLightingMode] = useState<'day' | 'fluorescent' | 'studio'>('day');
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [activeModule, setActiveModule] = useState<ActiveModule>('01_scale');

  const resetCameraFnRef = useRef<(() => void) | null>(null);
  const isAudioPlayingRef = useRef<boolean>(false);

  // Synchronize isAudioPlayingRef with state
  useEffect(() => {
    isAudioPlayingRef.current = isAudioPlaying;
  }, [isAudioPlaying]);

  // Audio Speech Synthesis in authentic Vietnamese
  const speakText = useCallback((text: string) => {
    isAudioPlayingRef.current = true;
    setIsAudioPlaying(true);
    vietnameseAudio.speak(text, {
      onStart: () => {
        isAudioPlayingRef.current = true;
        setIsAudioPlaying(true);
      },
      onEnd: () => {
        isAudioPlayingRef.current = false;
        setIsAudioPlaying(false);
      },
      onError: () => {
        isAudioPlayingRef.current = false;
        setIsAudioPlaying(false);
      }
    });
  }, []);

  const toggleAudio = useCallback(() => {
    if (isAudioPlayingRef.current) {
      vietnameseAudio.stop();
      isAudioPlayingRef.current = false;
      setIsAudioPlaying(false);
    } else {
      if (selectedStructure) {
        speakText(`${selectedStructure.vietnameseName}. Vị trí: ${selectedStructure.location}. ${selectedStructure.functionText}`);
      } else if (selectedEntity) {
        speakText(`${selectedEntity.vietnameseName}. Kích thước: ${selectedEntity.dimensions}. ${selectedEntity.summary}. ${selectedEntity.description}`);
      } else {
        if (activeModule === '01_scale') {
          speakText('Thang đo kích thước các cấp độ sinh học, từ nguyên tử 0,1 nano mét đến tế bào kích thước 1 mi-li-mét. Bạn có thể chọn từng đối tượng để quan sát chi tiết.');
        } else if (activeModule === '02_bacteria') {
          speakText('Các dạng hình thái vi khuẩn: trực khuẩn, cầu khuẩn, phẩy khuẩn và xoắn khuẩn.');
        } else {
          speakText('Mô hình 3D tương tác Tế bào nhân sơ, Sinh học 10, Bộ sách Kết nối tri thức với cuộc sống. Bạn có thể xoay 360 độ, phóng to thu nhỏ, tách lớp và khám phá chức năng sinh học.');
        }
      }
    }
  }, [selectedStructure, selectedEntity, activeModule, speakText]);

  // Handle entity selection in scale view
  const handleSelectEntity = useCallback((entity: BioEntity | null) => {
    if (!entity) {
      setSelectedEntity(null);
      setIsInfoOpen(false);
      return;
    }
    setSelectedEntity(entity);
    setIsInfoOpen(true);
    setSliderPos(entity.scaleLogPosition);
    if (isAudioPlayingRef.current) {
      speakText(`${entity.vietnameseName}. Kích thước ${entity.dimensions}. ${entity.summary}`);
    }
  }, [speakText]);

  // Exit / Reset all focused views
  const handleExit = useCallback(() => {
    setSelectedEntity(null);
    setSelectedStructure(null);
    setIsInfoOpen(false);
    setIsDrawingActive(false);
    if (activeModule !== '01_scale') {
      setActiveModule('01_scale');
    }
    if (resetCameraFnRef.current) {
      resetCameraFnRef.current();
    }
  }, [activeModule]);

  // Cycle lighting mode
  const handleCycleLighting = useCallback(() => {
    setLightingMode(prev => {
      if (prev === 'day') return 'fluorescent';
      if (prev === 'fluorescent') return 'studio';
      return 'day';
    });
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none flex flex-col">
      {/* 1. Top Navigation Bar */}
      <TopHeader
        onExit={handleExit}
        isDrawingActive={isDrawingActive}
        onToggleDrawing={() => setIsDrawingActive(!isDrawingActive)}
        onOpenWhiteboard={() => setIsWhiteboardOpen(true)}
        onOpenQuiz={() => setIsQuizOpen(true)}
        activeModule={activeModule}
      />

      {/* 2. Main 3D Viewport: switches between Scale Ruler and Dedicated 3D Prokaryote Model */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        {activeModule === '01_scale' ? (
          <>
            <ThreeCanvas
              selectedEntity={selectedEntity}
              onSelectEntity={handleSelectEntity}
              showLabels={showLabels}
              lightingMode={lightingMode}
              onResetCameraReady={fn => (resetCameraFnRef.current = fn)}
              onSliderFlyTo={pos => setSliderPos(pos)}
              sliderPos={sliderPos}
              activeModule={activeModule}
            />

            {/* Quick Scale Rail */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-slate-200/80">
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-[65vw] py-0.5 no-scrollbar">
                {BIO_ENTITIES.map(entity => {
                  const isSelected = selectedEntity?.id === entity.id;
                  return (
                    <button
                      key={entity.id}
                      onClick={() => handleSelectEntity(isSelected ? null : entity)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-300'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{entity.vietnameseName}</span>
                      <span className="text-[10px] opacity-75 ml-1 font-mono">({entity.scaleLabel})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : activeModule === '02_bacteria' ? (
          /* Tab 02: Hình thái, Kích thước và Các dạng Vi khuẩn (Trực khuẩn, Cầu khuẩn, Phẩy khuẩn, Xoắn khuẩn) */
          <BacteriaMorphology3D
            onSpeak={speakText}
            isSpeaking={isAudioPlaying}
          />
        ) : activeModule === '03_prokaryote_structure' ? (
          /* Tab 03: Cấu tạo Tế bào Nhân sơ & Bóc tách 5 lớp */
          <>
            <Prokaryote3DModel
              selectedStructureId={selectedStructure?.id || null}
              onSelectStructure={struct => {
                setSelectedStructure(struct);
                if (struct && isAudioPlaying) {
                  speakText(`${struct.vietnameseName}. ${struct.functionText}`);
                }
              }}
              onTargetClickedIn3D={structId => setLastClicked3DId(structId)}
              isTeacherMode={isTeacherMode}
              onToggleTeacherMode={() => setIsTeacherMode(!isTeacherMode)}
              onOpenTasks={() => setIsTasksOpen(true)}
            />

            {/* Discovery Mode: Structure Inspection Card */}
            <StructureInspectionCard
              structure={selectedStructure}
              onClose={() => setSelectedStructure(null)}
              onSpeak={speakText}
              isSpeaking={isAudioPlaying}
            />
          </>
        ) : activeModule === '04_compare' ? (
          <ComparisonView
            onBackToScale={() => setActiveModule('01_scale')}
            onSpeak={speakText}
            isSpeaking={isAudioPlaying}
          />
        ) : (
          <CellWallExplorer onBackToScale={() => setActiveModule('01_scale')} />
        )}
      </main>

      {/* 3. Right Toolbar */}
      <RightToolbar
        onResetCamera={() => {
          if (resetCameraFnRef.current) resetCameraFnRef.current();
          setSelectedEntity(null);
          setSelectedStructure(null);
        }}
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels(!showLabels)}
        isAudioPlaying={isAudioPlaying}
        onToggleAudio={toggleAudio}
        isInfoOpen={isInfoOpen}
        onToggleInfo={() => setIsInfoOpen(!isInfoOpen)}
        lightingMode={lightingMode}
        onCycleLighting={handleCycleLighting}
      />

      {/* 4. Biological Entity Info Drawer for Module 01 */}
      <InfoDrawer
        entity={selectedEntity}
        isOpen={isInfoOpen && activeModule === '01_scale'}
        onClose={() => setIsInfoOpen(false)}
        onSpeak={speakText}
        isSpeaking={isAudioPlaying}
      />

      {/* 5. Bottom Navigation Bar */}
      <BottomNav
        activeModule={activeModule}
        onSelectModule={mod => {
          setActiveModule(mod);
          setSelectedEntity(null);
          setSelectedStructure(null);
        }}
      />

      {/* 6. Annotation Pen Drawing Canvas */}
      <DrawingOverlay
        isActive={isDrawingActive}
        onClose={() => setIsDrawingActive(false)}
      />

      {/* 7. Educational Whiteboard Modal */}
      <WhiteboardModal
        isOpen={isWhiteboardOpen}
        onClose={() => setIsWhiteboardOpen(false)}
      />

      {/* 8. Quiz Practice Modal */}
      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
      />

      {/* 9. Student Interactive Tasks (6 Task types) */}
      <StudentTasksModal
        isOpen={isTasksOpen}
        onClose={() => setIsTasksOpen(false)}
        lastClickedStructureId={lastClicked3DId}
      />

      {/* 10. Teacher Mode Control Console */}
      <TeacherModePanel
        isOpen={isTeacherMode}
        onClose={() => setIsTeacherMode(false)}
        onSelectStructure={st => setSelectedStructure(st)}
        selectedStructureId={selectedStructure?.id || null}
        onToggleLabels={() => setShowLabels(!showLabels)}
        showLabels={showLabels}
        onReset={() => {
          setSelectedStructure(null);
          if (resetCameraFnRef.current) resetCameraFnRef.current();
        }}
        onOpenTasks={() => setIsTasksOpen(true)}
        onSetExplosion={val => {
          // Handled via state or ref
        }}
        onSetMagnification={lvl => {
          // Handled via magnification
        }}
      />
    </div>
  );
}

