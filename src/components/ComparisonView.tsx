import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import {
  ArrowLeftRight,
  Box,
  Image as ImageIcon,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Layers,
  HelpCircle,
  Eye,
  Maximize2
} from 'lucide-react';
import { buildRealisticBacteriumModel, BacteriumModelResult } from './BacteriumModelBuilder';
import { buildRealisticAnimalCellModel } from './AnimalCellModelBuilder';
import { buildRealisticPlantCellModel } from './PlantCellModelBuilder';

interface ComparisonViewProps {
  onBackToScale: () => void;
  onSpeak?: (text: string) => void;
  isSpeaking?: boolean;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  onBackToScale,
  onSpeak,
  isSpeaking = false
}) => {
  // Mode controls
  const [viewMode, setViewMode] = useState<'3d' | 'diagram'>('3d');
  const [eukaryoteType, setEukaryoteType] = useState<'animal' | 'plant'>('animal');
  const [scaleMode, setScaleMode] = useState<'equal' | 'real'>('equal');
  const [activeCriterion, setActiveCriterion] = useState<number>(0);
  const [isCriteriaExpanded, setIsCriteriaExpanded] = useState<boolean>(true);

  // 3D Canvas Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // 3D Model groups
  const prokGroupRef = useRef<THREE.Group | null>(null);
  const eukGroupRef = useRef<THREE.Group | null>(null);
  const flagellaAnimRef = useRef<((t: number) => void) | null>(null);

  // Camera animation
  const targetCamPos = useRef(new THREE.Vector3(0, 3.5, 17));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  // Mouse orbit controls
  const isDragging = useRef(false);
  const previousMouse = useRef({ x: 0, y: 0 });

  // 6 Core Biology Criteria
  const criteria = [
    {
      id: 0,
      title: '1. Cấu trúc Nhân & Vật chất di truyền',
      prokaryote: 'Chưa có màng nhân bao bọc (chỉ có vùng nhân Nucleoid), phân tử ADN kép dạng vòng trần không gắn histone.',
      eukaryote: 'Có màng nhân kép với lỗ nhân bao bọc, ADN xoắn kép liên kết với protein histon tạo thành các nhiễm sắc thể.',
      analysis: 'Nhân thực bảo vệ ADN tối ưu khỏi các enzym tế bào chất và kiểm soát biểu hiện gen qua nhiều tầng điều hòa phiên mã phức tạp.'
    },
    {
      id: 1,
      title: '2. Hệ thống bào quan có màng bọc',
      prokaryote: 'Hoàn toàn không có (không có ty thể, lục lạp, bộ máy Golgi, lưới nội chất, lysosome).',
      eukaryote: 'Có hệ thống màng nội bào chia tế bào chất thành các xoang riêng biệt; chứa nhiều bào quan có màng (ty thể, Golgi, ER, lục lạp ở thực vật).',
      analysis: 'Sự phân vùng màng cho phép tế bào nhân thực tiến hành đồng thời nhiều phản ứng sinh hóa ngược chiều nhau mà không bị ức chế lẫn nhau.'
    },
    {
      id: 2,
      title: '3. Kích thước tế bào & Tỉ lệ S/V',
      prokaryote: 'Rất nhỏ (1 - 5 µm), tỉ lệ diện tích/thể tích (S/V) cực lớn.',
      eukaryote: 'Lớn hơn nhiều (10 - 100 µm, thể tích gấp khoảng 1.000 đến 10.000 lần nhân sơ), tỉ lệ S/V nhỏ hơn.',
      analysis: 'Tỉ lệ S/V lớn giúp vi khuẩn trao đổi chất với môi trường cực nhanh, sinh trưởng và phân chia thần tốc trong điều kiện thuận lợi.'
    },
    {
      id: 3,
      title: '4. Ribosome tổng hợp protein',
      prokaryote: 'Ribosome 70S (tiểu phần lớn 50S và tiểu phần nhỏ 30S).',
      eukaryote: 'Ribosome 80S (tiểu phần lớn 60S và tiểu phần nhỏ 40S) trong tế bào chất; riêng bên trong ty thể & lục lạp có ribosome 70S.',
      analysis: 'Sự xuất hiện của ribosome 70S và ADN vòng trong ty thể/lục lạp là bằng chứng vàng khẳng định Thuyết nội cộng sinh (Endosymbiotic Theory).'
    },
    {
      id: 4,
      title: '5. Thành tế bào (Cell Wall)',
      prokaryote: 'Cấu tạo từ Peptidoglycan (dày ở vi khuẩn Gram dương, mỏng kèm màng ngoài ở vi khuẩn Gram âm).',
      eukaryote: 'Cellulose ở tế bào thực vật, Chitin ở nấm; tế bào động vật hoàn toàn không có thành tế bào.',
      analysis: 'Thành peptidoglycan là lá chắn cơ học độc nhất của vi khuẩn, cũng là đích tấn công hoàn hảo của các thuốc kháng sinh (như Penicillin).'
    },
    {
      id: 5,
      title: '6. Hình thức phân chia tế bào',
      prokaryote: 'Phân đôi trực tiếp (Binary fission), không hình thành thoi phân bào (tơ vô sắc).',
      eukaryote: 'Nguyên phân (Mitosis) và Giảm phân (Meiosis) với sự tham gia của thoi phân bào và bộ máy phân chia tinh vi.',
      analysis: 'Phân đôi chỉ mất 20 - 30 phút/thế hệ, trong khi chu kỳ nguyên phân ở sinh vật nhân thực đòi hỏi nhiều giờ đến nhiều ngày kiểm soát qua các điểm chốt (checkpoints).'
    }
  ];

  // Reset Camera View
  const handleResetCamera = useCallback(() => {
    targetCamPos.current.set(0, 3.5, 17);
    targetLookAt.current.set(0, 0, 0);
  }, []);

  // Initialize and manage 3D Three.js Scene
  useEffect(() => {
    if (viewMode !== '3d') return;
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x090d16);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 3.5, 17);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight1.position.set(8, 14, 12);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 1.0);
    dirLight2.position.set(-10, -5, -6);
    scene.add(dirLight2);

    // Subtle floor grid
    const grid = new THREE.GridHelper(26, 26, 0x1e293b, 0x0f172a);
    grid.position.y = -3.8;
    scene.add(grid);

    // 5. Left Model: Tế bào Nhân sơ (Vi khuẩn)
    const bResult: BacteriumModelResult = buildRealisticBacteriumModel();
    const prokGroup = bResult.group;
    prokGroupRef.current = prokGroup;
    flagellaAnimRef.current = bResult.updateFlagellaAnimation;

    // Position Prokaryote at Left (-5.2)
    prokGroup.position.set(-5.2, -0.4, 0);
    prokGroup.rotation.y = Math.PI * 0.15;
    scene.add(prokGroup);

    // 6. Right Model: Tế bào Nhân thực (Động vật / Thực vật)
    const eukGroup = eukaryoteType === 'animal'
      ? buildRealisticAnimalCellModel()
      : buildRealisticPlantCellModel();
    eukGroupRef.current = eukGroup;

    // Position Eukaryote at Right (+5.2)
    eukGroup.position.set(5.2, -0.4, 0);
    eukGroup.rotation.y = -Math.PI * 0.15;
    scene.add(eukGroup);

    // 7. Mouse Orbit Controls
    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      previousMouse.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !cameraRef.current) return;
      const deltaX = e.clientX - previousMouse.current.x;
      const deltaY = e.clientY - previousMouse.current.y;
      previousMouse.current = { x: e.clientX, y: e.clientY };

      const cam = cameraRef.current;
      const offset = cam.position.clone().sub(targetLookAt.current);
      let radius = offset.length();
      let theta = Math.atan2(offset.x, offset.z);
      let phi = Math.acos(Math.max(-1, Math.min(1, offset.y / radius)));

      theta -= deltaX * 0.007;
      phi -= deltaY * 0.007;
      phi = Math.max(0.15, Math.min(Math.PI - 0.15, phi));

      targetCamPos.current.x = targetLookAt.current.x + radius * Math.sin(phi) * Math.sin(theta);
      targetCamPos.current.y = targetLookAt.current.y + radius * Math.cos(phi);
      targetCamPos.current.z = targetLookAt.current.z + radius * Math.sin(phi) * Math.cos(theta);
    };

    const onMouseUp = () => {
      isDragging.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      const cam = cameraRef.current;
      const offset = cam.position.clone().sub(targetLookAt.current);
      let radius = offset.length();
      radius += e.deltaY * 0.015;
      radius = Math.max(8, Math.min(32, radius));
      offset.normalize().multiplyScalar(radius);
      targetCamPos.current.copy(targetLookAt.current).add(offset);
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });

    // 8. Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 9. Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera lerp
      if (cameraRef.current) {
        cameraRef.current.position.lerp(targetCamPos.current, 0.08);
        currentLookAt.current.lerp(targetLookAt.current, 0.08);
        cameraRef.current.lookAt(currentLookAt.current);
      }

      // Gentle floating and idle rotation
      if (prokGroupRef.current) {
        prokGroupRef.current.rotation.y = Math.PI * 0.15 + Math.sin(elapsedTime * 0.5) * 0.1;
        prokGroupRef.current.position.y = -0.4 + Math.sin(elapsedTime * 1.2) * 0.08;
      }
      if (eukGroupRef.current) {
        eukGroupRef.current.rotation.y = -Math.PI * 0.15 + Math.sin(elapsedTime * 0.4 + 1) * 0.08;
        eukGroupRef.current.position.y = -0.4 + Math.sin(elapsedTime * 1.1 + 0.5) * 0.08;
      }

      // Animate bacterium flagella
      if (flagellaAnimRef.current) {
        flagellaAnimRef.current(elapsedTime);
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('wheel', onWheel);
      renderer.dispose();
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
    };
  }, [viewMode, eukaryoteType]);

  // Handle Scale Mode adjustment
  useEffect(() => {
    if (!prokGroupRef.current || !eukGroupRef.current) return;
    if (scaleMode === 'real') {
      // Real scale: Prokaryote is 10x smaller in diameter
      prokGroupRef.current.scale.set(0.35, 0.35, 0.35);
      eukGroupRef.current.scale.set(1.4, 1.4, 1.4);
    } else {
      // Equal inspection scale: both scaled for comfortable organelle viewing
      prokGroupRef.current.scale.set(1.0, 1.0, 1.0);
      eukGroupRef.current.scale.set(1.0, 1.0, 1.0);
    }
  }, [scaleMode]);

  // Read current criterion out loud in Vietnamese
  const handleReadCriterion = (item: typeof criteria[0]) => {
    if (onSpeak) {
      const fullText = `Tiêu chí: ${item.title}. Tế bào nhân sơ: ${item.prokaryote}. Tế bào nhân thực: ${item.eukaryote}. Ý nghĩa tiến hóa: ${item.analysis}`;
      onSpeak(fullText);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950 flex flex-col">
      {/* 1. Top Control Bar */}
      <div className="absolute top-16 inset-x-5 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: View Mode Switches */}
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-2xl pointer-events-auto">
          <button
            onClick={() => setViewMode('3d')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === '3d'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Mô hình 3D Đối chiếu</span>
          </button>

          <button
            onClick={() => setViewMode('diagram')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'diagram'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Sơ đồ Giải phẫu Cắt lớp</span>
          </button>
        </div>

        {/* Center: Eukaryote Type Switch & Scale Mode Switch (When in 3D Mode) */}
        {viewMode === '3d' && (
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Eukaryote Type Selector */}
            <div className="flex items-center bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-xl text-xs">
              <span className="text-[11px] text-slate-400 font-semibold px-2">Nhân thực:</span>
              <button
                onClick={() => setEukaryoteType('animal')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  eukaryoteType === 'animal'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                🐾 Tế bào Động vật
              </button>
              <button
                onClick={() => setEukaryoteType('plant')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  eukaryoteType === 'plant'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                🌿 Tế bào Thực vật
              </button>
            </div>

            {/* Scale Comparison Toggle */}
            <button
              onClick={() => setScaleMode(scaleMode === 'equal' ? 'real' : 'equal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-xl backdrop-blur-md transition-all cursor-pointer ${
                scaleMode === 'real'
                  ? 'bg-purple-600 text-white border-purple-400 ring-2 ring-purple-400/40'
                  : 'bg-slate-900/90 text-slate-200 border-white/10 hover:bg-slate-800'
              }`}
              title="Nhấn để đối chiếu tỉ lệ kích thước thật (1:10) giữa Nhân sơ và Nhân thực"
            >
              <Maximize2 className="w-3.5 h-3.5 text-purple-300" />
              <span>
                {scaleMode === 'real' ? 'Tỉ lệ Thực tế (1 : 10)' : 'Tỉ lệ Soi chi tiết (1 : 1)'}
              </span>
            </button>

            {/* Reset Camera button */}
            <button
              onClick={handleResetCamera}
              className="p-2 rounded-xl bg-slate-900/90 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-800 shadow-xl transition-all cursor-pointer"
              title="Đặt lại góc nhìn 3D"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Right: Return to scale */}
        <button
          onClick={onBackToScale}
          className="px-3.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-2xl border border-white/10 shadow-xl transition-all cursor-pointer pointer-events-auto"
        >
          ← Về Thang đo 3D
        </button>
      </div>

      {/* 2. Main Viewport: 3D Dual-Model vs 2D Diagram */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {viewMode === '3d' ? (
          <>
            {/* 3D WebGL Canvas */}
            <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* 3D Overlaid Header Badges for Left vs Right Cell */}
            <div className="absolute top-28 left-8 z-10 pointer-events-none flex flex-col gap-1 bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-cyan-500/30 text-white shadow-xl max-w-xs animate-in fade-in duration-300">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  Tế bào Nhân sơ (Prokaryote)
                </span>
              </div>
              <span className="text-sm font-extrabold text-white">Vi khuẩn Trực khuẩn (E. coli)</span>
              <div className="flex items-center gap-2 text-[11px] text-slate-300 mt-1">
                <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-200 font-mono">1 – 5 µm</span>
                <span>Chưa có màng nhân • Không bào quan có màng</span>
              </div>
            </div>

            <div className="absolute top-28 right-8 z-10 pointer-events-none flex flex-col gap-1 bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-indigo-500/30 text-white shadow-xl max-w-xs animate-in fade-in duration-300 text-right">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  Tế bào Nhân thực (Eukaryote)
                </span>
                <span className="w-3 h-3 rounded-full bg-indigo-400 animate-pulse" />
              </div>
              <span className="text-sm font-extrabold text-white">
                {eukaryoteType === 'animal' ? 'Tế bào Động vật' : 'Tế bào Thực vật'}
              </span>
              <div className="flex items-center gap-2 text-[11px] text-slate-300 mt-1 justify-end">
                <span>Nhân có màng bọc • Ty thể, Golgi, Lưới nội chất</span>
                <span className="px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-200 font-mono">10 – 100 µm</span>
              </div>
            </div>

            {/* Instruction tooltip in center */}
            <div className="absolute top-28 left-1/2 -translate-x-1/2 z-10 pointer-events-none px-3 py-1 bg-slate-900/60 backdrop-blur-sm rounded-full border border-white/5 text-[11px] text-slate-400">
              🖱️ Kéo chuột xoay 360° • Cuộn chuột phóng to/thu nhỏ
            </div>
          </>
        ) : (
          /* 2D High-Resolution Diagram & Schematic Cross-Section View */
          <div className="w-full h-full overflow-y-auto p-6 pt-24 pb-36 max-w-6xl mx-auto flex flex-col gap-6">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-extrabold text-white flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Sơ đồ Giải phẫu Đối chiếu Cắt lớp Siêu cấu trúc</span>
              </h2>
              <p className="text-xs text-slate-400 max-w-2xl mx-auto">
                Đối chiếu trực quan sự khác biệt cốt lõi về tổ chức tế bào giữa Sinh vật Nhân sơ (Prokaryota) và Sinh vật Nhân thực (Eukaryota).
              </p>
            </div>

            {/* Side-by-Side Schematic Visual Graphic */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Card 1: Prokaryote Anatomy */}
              <div className="bg-slate-900/90 rounded-3xl p-5 border border-cyan-500/30 shadow-2xl flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-cyan-400" />
                    <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">
                      1. Tế bào Nhân sơ (Vi khuẩn E. coli)
                    </h3>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-cyan-950 border border-cyan-700/50 text-cyan-300 rounded-lg font-mono font-bold">
                    1 – 5 µm
                  </span>
                </div>

                {/* Illustrated SVG Schematic diagram */}
                <div className="relative w-full h-56 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-center overflow-hidden p-2">
                  <svg viewBox="0 0 400 240" className="w-full h-full">
                    <defs>
                      <linearGradient id="prokGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#0f766e" stopOpacity="0.8" />
                      </linearGradient>
                      <linearGradient id="capsuleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
                      </linearGradient>
                    </defs>

                    {/* Flagella helical tail */}
                    <path
                      d="M 60,120 Q 35,90 20,120 T -10,130"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Capsule jelly envelope */}
                    <rect x="70" y="55" width="260" height="130" rx="65" fill="url(#capsuleGrad)" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />

                    {/* Cell Wall */}
                    <rect x="80" y="65" width="240" height="110" rx="55" fill="none" stroke="#f59e0b" strokeWidth="3" />

                    {/* Plasma Membrane */}
                    <rect x="88" y="73" width="224" height="94" rx="47" fill="url(#prokGrad)" stroke="#10b981" strokeWidth="2" />

                    {/* Nucleoid Circular DNA tangle */}
                    <path
                      d="M 160,115 C 150,95 210,90 220,110 C 230,130 180,140 170,120 C 160,100 240,110 230,130 C 210,145 150,135 160,115 Z"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="3"
                    />
                    <text x="180" y="125" fill="#fca5a5" fontSize="10" fontWeight="bold">Vùng nhân ADN</text>

                    {/* Ribosomes 70S dots */}
                    <circle cx="120" cy="100" r="3" fill="#facc15" />
                    <circle cx="135" cy="140" r="3" fill="#facc15" />
                    <circle cx="270" cy="110" r="3" fill="#facc15" />
                    <circle cx="250" cy="145" r="3" fill="#facc15" />
                    <circle cx="140" cy="115" r="2.5" fill="#facc15" />
                    <circle cx="260" cy="95" r="2.5" fill="#facc15" />

                    {/* Plasmid ring */}
                    <ellipse cx="265" cy="130" rx="10" ry="7" fill="none" stroke="#ec4899" strokeWidth="2.5" />
                    <text x="250" y="152" fill="#f472b6" fontSize="9" fontWeight="bold">Plasmid</text>

                    {/* Pili hairs */}
                    <line x1="120" y1="55" x2="115" y2="40" stroke="#94a3b8" strokeWidth="1.5" />
                    <line x1="170" y1="55" x2="170" y2="38" stroke="#94a3b8" strokeWidth="1.5" />
                    <line x1="230" y1="55" x2="235" y2="40" stroke="#94a3b8" strokeWidth="1.5" />
                    <line x1="280" y1="65" x2="295" y2="52" stroke="#94a3b8" strokeWidth="1.5" />
                    <line x1="120" y1="185" x2="115" y2="200" stroke="#94a3b8" strokeWidth="1.5" />
                    <line x1="180" y1="185" x2="180" y2="202" stroke="#94a3b8" strokeWidth="1.5" />
                    <line x1="240" y1="185" x2="245" y2="200" stroke="#94a3b8" strokeWidth="1.5" />
                  </svg>
                </div>

                {/* Key features bullets */}
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    <span><strong>Vùng nhân (Nucleoid):</strong> Không màng bọc, 1 phân tử ADN vòng kép.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span><strong>Ribosome 70S:</strong> Kích thước nhỏ, trôi nổi tự do trong bào tương.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span><strong>3 lớp vỏ bọc:</strong> Vỏ nhầy (Capsule) → Thành Peptidoglycan → Màng sinh chất.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                    <span><strong>Bào quan có màng:</strong> Hoàn toàn không có.</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Eukaryote Anatomy */}
              <div className="bg-slate-900/90 rounded-3xl p-5 border border-indigo-500/30 shadow-2xl flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-indigo-500/20">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-indigo-400" />
                    <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider">
                      2. Tế bào Nhân thực (Động vật / Thực vật)
                    </h3>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-indigo-950 border border-indigo-700/50 text-indigo-300 rounded-lg font-mono font-bold">
                    10 – 100 µm
                  </span>
                </div>

                {/* Illustrated SVG Schematic diagram */}
                <div className="relative w-full h-56 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-center overflow-hidden p-2">
                  <svg viewBox="0 0 400 240" className="w-full h-full">
                    <defs>
                      <linearGradient id="eukGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#312e81" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.9" />
                      </linearGradient>
                      <linearGradient id="nucleusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#9333ea" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#6b21a8" stopOpacity="0.9" />
                      </linearGradient>
                    </defs>

                    {/* Plasma membrane organic outer shape */}
                    <path
                      d="M 60,120 C 60,60 140,40 210,45 C 290,50 350,80 345,140 C 340,195 280,215 190,210 C 110,205 60,180 60,120 Z"
                      fill="url(#eukGrad)"
                      stroke="#818cf8"
                      strokeWidth="2.5"
                    />

                    {/* True Nucleus with double membrane & nucleolus */}
                    <circle cx="160" cy="120" r="42" fill="url(#nucleusGrad)" stroke="#c084fc" strokeWidth="2.5" />
                    {/* Nuclear pore markers */}
                    <circle cx="160" cy="78" r="2" fill="#fbbf24" />
                    <circle cx="202" cy="120" r="2" fill="#fbbf24" />
                    <circle cx="160" cy="162" r="2" fill="#fbbf24" />
                    <circle cx="118" cy="120" r="2" fill="#fbbf24" />
                    {/* Dense nucleolus */}
                    <circle cx="150" cy="115" r="14" fill="#3b82f6" />
                    <text x="142" y="119" fill="#ffffff" fontSize="9" fontWeight="bold">Hạch nhân</text>
                    <text x="145" y="145" fill="#e9d5ff" fontSize="9" fontWeight="bold">Màng nhân kép</text>

                    {/* Mitochondrion with cristae folds */}
                    <g transform="translate(255, 80) rotate(25)">
                      <ellipse cx="0" cy="0" rx="26" ry="14" fill="#ea580c" stroke="#fed7aa" strokeWidth="1.5" />
                      <path d="M -16,0 Q -10,-6 -4,0 Q 2,6 8,0 Q 14,-6 18,0" fill="none" stroke="#fff" strokeWidth="1.5" />
                    </g>
                    <text x="240" y="65" fill="#fdba74" fontSize="9" fontWeight="bold">Ty thể (Mitochondria)</text>

                    {/* Golgi Apparatus stacks */}
                    <g transform="translate(260, 160) rotate(-15)">
                      <path d="M -22,-8 Q 0,-2 22,-8" fill="none" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" />
                      <path d="M -20,-1 Q 0,4 20,-1" fill="none" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" />
                      <path d="M -18,6 Q 0,11 18,6" fill="none" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="24" cy="-5" r="2.5" fill="#f472b6" />
                      <circle cx="-25" cy="4" r="2" fill="#f472b6" />
                    </g>
                    <text x="245" y="188" fill="#f472b6" fontSize="9" fontWeight="bold">Bộ máy Golgi</text>

                    {/* Rough Endoplasmic Reticulum (RER) wraps nucleus */}
                    <path
                      d="M 120,85 C 105,75 100,105 102,125 C 105,145 120,165 130,170"
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <circle cx="106" cy="95" r="1.5" fill="#f43f5e" />
                    <circle cx="98" cy="115" r="1.5" fill="#f43f5e" />
                    <circle cx="103" cy="135" r="1.5" fill="#f43f5e" />
                    <circle cx="112" cy="155" r="1.5" fill="#f43f5e" />
                    <text x="80" y="80" fill="#a5b4fc" fontSize="9" fontWeight="bold">Lưới nội chất (ER)</text>
                  </svg>
                </div>

                {/* Key features bullets */}
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                    <span><strong>Nhân chính thức:</strong> Có màng kép bảo vệ, chứa nhiễm sắc thể (ADN + histone).</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                    <span><strong>Ribosome 80S:</strong> Đính trên màng RER hoặc trôi nổi trong tế bào chất.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                    <span><strong>Hệ thống bào quan:</strong> Ty thể hô hấp, Golgi hoàn thiện protein, Lysosome tiêu hóa.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span><strong>Phân vùng tế bào chất:</strong> Ranh giới màng nội bào tạo các tiểu khoang chuyên hóa.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Bottom Interactive Scientific Comparison Criteria Panel */}
      <div className="absolute bottom-16 md:bottom-18 inset-x-4 md:inset-x-8 z-20 flex flex-col gap-2 pointer-events-none">
        <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-3.5 max-h-[38vh] overflow-hidden flex flex-col transition-all duration-300 pointer-events-auto">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Đối chiếu 6 Tiêu chí Sinh học cốt lõi
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-mono">
                {activeCriterion + 1} / {criteria.length}
              </span>
              <button
                onClick={() => setIsCriteriaExpanded(!isCriteriaExpanded)}
                className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer font-semibold"
              >
                {isCriteriaExpanded ? 'Thu gọn' : 'Mở rộng'}
              </button>
            </div>
          </div>

          {/* Criteria Pills Tab */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 no-scrollbar">
            {criteria.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCriterion(idx)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCriterion === idx
                    ? 'bg-blue-600 text-white shadow-md ring-1 ring-blue-300'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <span>{item.title}</span>
              </button>
            ))}
          </div>

          {/* Active Criterion Details & Audio Speak Button */}
          {isCriteriaExpanded && (
            <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs overflow-y-auto pr-1">
              <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-100 flex flex-col justify-between">
                <div>
                  <span className="font-bold text-cyan-300 block text-[11px] mb-0.5">
                    🦠 Tế bào Nhân sơ (Prokaryote)
                  </span>
                  <p className="leading-relaxed text-[11px]">{criteria[activeCriterion].prokaryote}</p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-100 flex flex-col justify-between">
                <div>
                  <span className="font-bold text-indigo-300 block text-[11px] mb-0.5">
                    🧫 Tế bào Nhân thực (Eukaryote)
                  </span>
                  <p className="leading-relaxed text-[11px]">{criteria[activeCriterion].eukaryote}</p>
                </div>

                <div className="mt-2 pt-1.5 border-t border-indigo-500/20 flex items-center justify-between text-[11px] text-amber-300 gap-2">
                  <span className="leading-snug">
                    💡 <strong>Tiến hóa:</strong> {criteria[activeCriterion].analysis}
                  </span>
                  {onSpeak && (
                    <button
                      onClick={() => handleReadCriterion(criteria[activeCriterion])}
                      className="p-1.5 rounded-lg bg-indigo-900/80 hover:bg-indigo-800 text-white shrink-0 transition-colors cursor-pointer"
                      title="Nghe thuyết minh tiêu chí này bằng tiếng Việt chuẩn"
                    >
                      {isSpeaking ? (
                        <VolumeX className="w-4 h-4 text-rose-400" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-amber-300" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
