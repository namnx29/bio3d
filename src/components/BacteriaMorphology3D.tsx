import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RotateCcw, Play, Pause, Eye, Sparkles, Volume2 } from 'lucide-react';

export type BacteriaShapeType = 'bacillus' | 'coccus' | 'vibrio' | 'spirillum';

interface BacteriaMorphologyProps {
  onSpeak: (text: string) => void;
  isSpeaking: boolean;
}

interface ShapeInfo {
  id: BacteriaShapeType;
  name: string;
  vietnameseName: string;
  dimensions: string;
  description: string;
  examples: string[];
}

const BACTERIA_SHAPES: ShapeInfo[] = [
  {
    id: 'bacillus',
    name: 'Bacillus (Rod-shaped)',
    vietnameseName: 'Trực khuẩn (Hình que)',
    dimensions: 'Dài 1 - 4 µm, rộng 0,5 - 1 µm',
    description: 'Tế bào có dạng hình que thẳng, có thể đứng đơn lẻ, xếp đôi hoặc thành chuỗi. Thường có roi bơi và lông bám.',
    examples: ['Escherichia coli (E. coli)', 'Bacillus subtilis (vi khuẩn đường ruột)', 'Bacillus anthracis (trực khuẩn than)']
  },
  {
    id: 'coccus',
    name: 'Coccus (Spherical)',
    vietnameseName: 'Cầu khuẩn (Hình cầu / Tụ cầu)',
    dimensions: 'Đường kính 0,5 - 1,2 µm',
    description: 'Tế bào hình cầu. Có thể phân chia theo nhiều mặt phẳng tạo thành chùm như chùm nho (tụ cầu khuẩn) hoặc chuỗi hạt (liên cầu khuẩn).',
    examples: ['Staphylococcus aureus (tụ cầu vàng)', 'Streptococcus pneumoniae (phế cầu)', 'Streptococcus mutans (gây sâu răng)']
  },
  {
    id: 'vibrio',
    name: 'Vibrio (Comma-shaped)',
    vietnameseName: 'Phẩy khuẩn (Hình dấu phẩy)',
    dimensions: 'Dài 1,5 - 2,5 µm, uốn cong',
    description: 'Tế bào hình que ngắn uốn cong nhẹ như dấu phẩy, có một roi đơn cực giúp vi khuẩn bơi rất nhanh theo chuyển động phi tiêu.',
    examples: ['Vibrio cholerae (phẩy khuẩn tả)', 'Vibrio parahaemolyticus (vi khuẩn ngộ độc hải sản)']
  },
  {
    id: 'spirillum',
    name: 'Spirillum (Spiral/Helical)',
    vietnameseName: 'Xoắn khuẩn (Hình xoắn ốc)',
    dimensions: 'Dài 3 - 15 µm, đường kính 0,2 - 0,5 µm',
    description: 'Tế bào có hình lượn sóng hoặc xoắn ốc dài dẻo dai. Vận động bằng cách vặn mình nhờ các sợi trục xoắn nội bào.',
    examples: ['Treponema pallidum (xoắn khuẩn giang mai)', 'Helicobacter pylori (vi khuẩn gây viêm loét dạ dày)']
  }
];

export const BacteriaMorphology3D: React.FC<BacteriaMorphologyProps> = ({ onSpeak, isSpeaking }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [activeShape, setActiveShape] = useState<BacteriaShapeType>('bacillus');
  const [isSwimming, setIsSwimming] = useState<boolean>(true);
  const [isolatedPart, setIsolatedPart] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState<boolean>(true);

  // 3D references
  const shapeMeshesGroupRef = useRef<THREE.Group | null>(null);
  const clickablePartsRef = useRef<{ [key: string]: THREE.Object3D }>({});
  const flagellaMeshesRef = useRef<THREE.Mesh[]>([]);

  // 2D label coordinates
  const [labelCoords, setLabelCoords] = useState<{ [id: string]: { x: number; y: number; visible: boolean } }>({});

  const currentShapeInfo = BACTERIA_SHAPES.find(s => s.id === activeShape) || BACTERIA_SHAPES[0];

  // Mouse orbit
  const isDragging = useRef(false);
  const prevMouse = useRef({ x: 0, y: 0 });
  const targetCamPos = useRef(new THREE.Vector3(0, 4, 14));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  const resetCamera = useCallback(() => {
    targetCamPos.current.set(0, 4, 14);
    targetLookAt.current.set(0, 0, 0);
    setIsolatedPart(null);
  }, []);

  // Handle solo click on label
  const handleToggleSoloPart = (partId: string) => {
    if (isolatedPart === partId) {
      // If clicking same part, show all
      setIsolatedPart(null);
    } else {
      // Isolate this clicked part only!
      setIsolatedPart(partId);
    }
  };

  // Build 3D models for the chosen bacterial shape
  const buildShapeModels = useCallback((scene: THREE.Scene, shape: BacteriaShapeType) => {
    if (shapeMeshesGroupRef.current) {
      scene.remove(shapeMeshesGroupRef.current);
    }

    const mainGroup = new THREE.Group();
    clickablePartsRef.current = {};
    flagellaMeshesRef.current = [];

    if (shape === 'bacillus') {
      // 1. Trực khuẩn hình que
      // Capsule
      const capGeo = new THREE.CapsuleGeometry(1.6, 3.8, 16, 24);
      const capMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.45,
        roughness: 0.2,
        transmission: 0.5
      });
      const capMesh = new THREE.Mesh(capGeo, capMat);
      capMesh.rotation.z = Math.PI / 2;
      mainGroup.add(capMesh);
      clickablePartsRef.current['capsule'] = capMesh;

      // Cell Wall
      const wallGeo = new THREE.CapsuleGeometry(1.45, 3.6, 16, 24);
      const wallMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.4 });
      const wallMesh = new THREE.Mesh(wallGeo, wallMat);
      wallMesh.rotation.z = Math.PI / 2;
      mainGroup.add(wallMesh);
      clickablePartsRef.current['cell_wall'] = wallMesh;

      // Flagella (Roi)
      const flagMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 });
      const flagGroup = new THREE.Group();
      for (let f = 0; f < 3; f++) {
        const pts: THREE.Vector3[] = [];
        const startX = -3.4;
        const startY = (f - 1) * 0.35;
        for (let s = 0; s < 30; s++) {
          pts.push(new THREE.Vector3(startX - s * 0.25, startY, 0));
        }
        const curve = new THREE.CatmullRomCurve3(pts);
        const fGeo = new THREE.TubeGeometry(curve, 30, 0.06, 6, false);
        const fMesh = new THREE.Mesh(fGeo, flagMat);
        fMesh.userData = { seed: f, startX, startY };
        flagGroup.add(fMesh);
        flagellaMeshesRef.current.push(fMesh);
      }
      mainGroup.add(flagGroup);
      clickablePartsRef.current['flagellum'] = flagGroup;

      // Pili (Lông)
      const piliMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.8 });
      const piliGroup = new THREE.Group();
      for (let p = 0; p < 50; p++) {
        const pGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.9, 4);
        const pilus = new THREE.Mesh(pGeo, piliMat);
        const theta = Math.random() * Math.PI * 2;
        const xPos = (Math.random() - 0.5) * 3.6;
        pilus.position.set(xPos, Math.cos(theta) * 1.8, Math.sin(theta) * 1.8);
        pilus.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pilus.position.clone().normalize());
        piliGroup.add(pilus);
      }
      mainGroup.add(piliGroup);
      clickablePartsRef.current['pili'] = piliGroup;

    } else if (shape === 'coccus') {
      // 2. Cầu khuẩn / Tụ cầu (Staphylococcus cluster)
      const coccusGroup = new THREE.Group();
      const sphereGeo = new THREE.SphereGeometry(0.85, 20, 20);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b, // Golden yellow for Staphylococcus aureus
        roughness: 0.3,
        metalness: 0.1
      });

      // Cluster of 16 spheres arranged like grapes
      const spherePositions = [
        [0, 0, 0], [1.3, 0.2, 0], [-1.2, -0.3, 0], [0.3, 1.3, 0.2],
        [-0.4, -1.2, 0.3], [0.6, 0.4, 1.2], [-0.5, 0.3, -1.2], [1.1, -0.8, 0.5],
        [-1.0, 1.0, 0.4], [0.2, -0.6, -1.3], [1.4, 1.1, -0.3], [-0.8, -1.0, -0.7],
        [0.8, -1.3, -0.4], [-1.3, 0.5, -0.8], [0.1, 1.5, -0.8], [0.5, 0.8, -1.4]
      ];

      spherePositions.forEach(([x, y, z]) => {
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        sphere.position.set(x, y, z);
        coccusGroup.add(sphere);
      });
      mainGroup.add(coccusGroup);
      clickablePartsRef.current['cell_wall'] = coccusGroup;

    } else if (shape === 'vibrio') {
      // 3. Phẩy khuẩn (Vibrio cholerae - Comma curve)
      const vibrioGroup = new THREE.Group();
      // Generate curved banana / comma shape using CatmullRomCurve3
      const commaPoints = [
        new THREE.Vector3(-2.2, -0.6, 0),
        new THREE.Vector3(-0.8, 0.4, 0),
        new THREE.Vector3(0.8, 0.7, 0),
        new THREE.Vector3(2.2, 0.1, 0)
      ];
      const commaCurve = new THREE.CatmullRomCurve3(commaPoints);
      const commaGeo = new THREE.TubeGeometry(commaCurve, 32, 0.9, 16, false);
      const commaMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4, // Teal / Cyan
        roughness: 0.35,
        metalness: 0.1
      });
      const commaBody = new THREE.Mesh(commaGeo, commaMat);
      vibrioGroup.add(commaBody);
      clickablePartsRef.current['cell_wall'] = commaBody;

      // Single long polar flagellum (Roi đơn cực)
      const flagMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 });
      const fPts: THREE.Vector3[] = [];
      const startX = -2.4;
      const startY = -0.7;
      for (let s = 0; s < 35; s++) {
        fPts.push(new THREE.Vector3(startX - s * 0.25, startY, 0));
      }
      const fCurve = new THREE.CatmullRomCurve3(fPts);
      const fGeo = new THREE.TubeGeometry(fCurve, 35, 0.07, 6, false);
      const fMesh = new THREE.Mesh(fGeo, flagMat);
      fMesh.userData = { seed: 1, startX, startY };
      vibrioGroup.add(fMesh);
      flagellaMeshesRef.current.push(fMesh);
      clickablePartsRef.current['flagellum'] = fMesh;

      mainGroup.add(vibrioGroup);

    } else if (shape === 'spirillum') {
      // 4. Xoắn khuẩn (Spirillum / Spirochete - Helical corkscrew)
      const spirillumGroup = new THREE.Group();
      const helixPoints: THREE.Vector3[] = [];
      const turns = 5;
      const length = 12;
      for (let i = 0; i < 120; i++) {
        const t = (i / 120) * (turns * Math.PI * 2);
        const x = (i / 120) * length - length / 2;
        const y = Math.sin(t) * 0.8;
        const z = Math.cos(t) * 0.8;
        helixPoints.push(new THREE.Vector3(x, y, z));
      }
      const helixCurve = new THREE.CatmullRomCurve3(helixPoints);
      const helixGeo = new THREE.TubeGeometry(helixCurve, 120, 0.45, 12, false);
      const helixMat = new THREE.MeshStandardMaterial({
        color: 0xa855f7, // Purple spiral
        roughness: 0.3,
        metalness: 0.2
      });
      const helixMesh = new THREE.Mesh(helixGeo, helixMat);
      spirillumGroup.add(helixMesh);
      clickablePartsRef.current['cell_wall'] = helixMesh;
      mainGroup.add(spirillumGroup);
    }

    scene.add(mainGroup);
    shapeMeshesGroupRef.current = mainGroup;
  }, []);

  // Sync isolated part visibility
  useEffect(() => {
    if (!shapeMeshesGroupRef.current) return;
    Object.entries(clickablePartsRef.current).forEach(([partKey, obj]) => {
      if (isolatedPart === null) {
        // Show all
        obj.visible = true;
      } else {
        // Only show isolated part!
        obj.visible = partKey === isolatedPart;
      }
    });
  }, [isolatedPart]);

  // Main Three.js setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);
    scene.fog = new THREE.FogExp2(0x090d16, 0.015);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 4, 14);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
    dirLight.position.set(10, 15, 15);
    scene.add(dirLight);

    const blueLight = new THREE.PointLight(0x38bdf8, 2, 25);
    blueLight.position.set(-10, -5, 5);
    scene.add(blueLight);

    // Floor grid
    const grid = new THREE.GridHelper(30, 30, 0x1e293b, 0x0f172a);
    grid.position.y = -4;
    scene.add(grid);

    // Build initial shape
    buildShapeModels(scene, activeShape);

    // Mouse handlers
    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isDragging.current = true;
        prevMouse.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !cameraRef.current) return;
      const dx = e.clientX - prevMouse.current.x;
      const dy = e.clientY - prevMouse.current.y;

      const rotSpeed = 0.005;
      const offset = cameraRef.current.position.clone().sub(currentLookAt.current);
      const radius = offset.length();

      let theta = Math.atan2(offset.x, offset.z);
      let phi = Math.acos(Math.max(-1, Math.min(1, offset.y / radius)));

      theta -= dx * rotSpeed;
      phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi - dy * rotSpeed));

      offset.x = radius * Math.sin(phi) * Math.sin(theta);
      offset.y = radius * Math.cos(phi);
      offset.z = radius * Math.sin(phi) * Math.cos(theta);

      cameraRef.current.position.copy(currentLookAt.current).add(offset);
      targetCamPos.current.copy(cameraRef.current.position);

      prevMouse.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      const offset = cameraRef.current.position.clone().sub(currentLookAt.current);
      const zoom = e.deltaY > 0 ? 1.08 : 0.92;
      const newLen = THREE.MathUtils.clamp(offset.length() * zoom, 4, 30);
      offset.setLength(newLen);
      cameraRef.current.position.copy(currentLookAt.current).add(offset);
      targetCamPos.current.copy(cameraRef.current.position);
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Camera lerp
      if (cameraRef.current) {
        cameraRef.current.position.lerp(targetCamPos.current, 0.08);
        currentLookAt.current.lerp(targetLookAt.current, 0.08);
        cameraRef.current.lookAt(currentLookAt.current);

        // Update 2D labels
        const newCoords: { [id: string]: { x: number; y: number; visible: boolean } } = {};
        const tempVec = new THREE.Vector3();

        Object.entries(clickablePartsRef.current).forEach(([pKey, obj]) => {
          if (obj.visible) {
            obj.getWorldPosition(tempVec);
            if (pKey === 'flagellum') tempVec.x -= 2.2;
            else if (pKey === 'pili') tempVec.y += 2.0;
            else tempVec.y += 2.2;

            tempVec.project(cameraRef.current!);
            const isBehind = tempVec.z > 1;
            const xCoord = (tempVec.x * 0.5 + 0.5) * container.clientWidth;
            const yCoord = (-tempVec.y * 0.5 + 0.5) * container.clientHeight;

            newCoords[pKey] = {
              x: xCoord,
              y: yCoord,
              visible: !isBehind && xCoord > 20 && xCoord < container.clientWidth - 20
            };
          }
        });
        setLabelCoords(newCoords);
      }

      // Live Swimming Flagella animation
      if (isSwimming) {
        flagellaMeshesRef.current.forEach(mesh => {
          const seed = mesh.userData.seed || 0;
          const startX = mesh.userData.startX || -3.4;
          const startY = mesh.userData.startY || 0;
          const newPts: THREE.Vector3[] = [];
          for (let s = 0; s < 30; s++) {
            const step = s * 0.25;
            const wave = elapsed * 8 + s * 0.5 + seed * 2;
            const amp = (s / 30) * 0.6;
            newPts.push(
              new THREE.Vector3(
                startX - step,
                startY + Math.sin(wave) * amp,
                Math.cos(wave) * amp
              )
            );
          }
          mesh.geometry.dispose();
          mesh.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(newPts), 30, 0.06, 6, false);
        });

        // Gentle floating
        if (shapeMeshesGroupRef.current) {
          shapeMeshesGroupRef.current.position.y = Math.sin(elapsed * 1.5) * 0.2;
          if (activeShape === 'spirillum') {
            shapeMeshesGroupRef.current.rotation.x = elapsed * 1.2;
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      renderer.dispose();
      if (container.contains(dom)) container.removeChild(dom);
    };
  }, [activeShape, buildShapeModels, isSwimming]);

  // When activeShape changes, rebuild
  const handleSelectShape = (shape: BacteriaShapeType) => {
    setActiveShape(shape);
    setIsolatedPart(null);
    if (sceneRef.current) {
      buildShapeModels(sceneRef.current, shape);
    }
  };

  const partNames: { [k: string]: string } = {
    capsule: 'Vỏ nhầy (Capsule)',
    cell_wall: 'Thành tế bào (Cell Wall)',
    flagellum: 'Roi bơi (Flagellum)',
    pili: 'Lông bám (Pili)'
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950" ref={containerRef}>
      {/* 1. Floating 3D Part Labels - Clicking one will isolate it! */}
      {showLabels &&
        Object.entries(labelCoords).map(([partId, coords]) => {
          if (!coords || !coords.visible) return null;
          const isSolo = isolatedPart === partId;

          return (
            <div
              key={partId}
              onClick={() => handleToggleSoloPart(partId)}
              style={{
                transform: `translate(${coords.x}px, ${coords.y}px) translate(-50%, -100%)`,
                transition: 'opacity 0.2s ease, transform 0.05s linear'
              }}
              className="absolute left-0 top-0 cursor-pointer pointer-events-auto z-20 group"
            >
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xl backdrop-blur-md transition-all duration-200 border ${
                  isSolo
                    ? 'bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-300 scale-110 font-bold'
                    : 'bg-slate-900/85 hover:bg-slate-800 text-slate-100 border-white/20 hover:scale-105'
                }`}
              >
                <span>{partNames[partId] || partId}</span>
                <span className="text-[10px] text-amber-300 ml-1">
                  {isSolo ? '(Đang solo)' : '(Click để chỉ hiện)'}
                </span>
              </div>
              <div className="w-0.5 h-3 bg-white/40 mx-auto" />
            </div>
          );
        })}

      {/* 2. Top-Center: Solo Banner Indicator */}
      {isolatedPart && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-amber-500/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-2xl text-slate-950 font-bold text-xs border border-amber-300 animate-in fade-in slide-in-from-top-4 duration-200">
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>Đang xem riêng biệt cấu trúc: {partNames[isolatedPart] || isolatedPart} (Các cấu trúc khác đã ẩn)</span>
          <button
            onClick={() => setIsolatedPart(null)}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow transition-all cursor-pointer"
          >
            👁️ Hiện lại tất cả
          </button>
        </div>
      )}

      {/* 3. Top-Left: Bacteria Shape Selector (Trực khuẩn, Cầu khuẩn, Phẩy khuẩn, Xoắn khuẩn) */}
      <div className="absolute top-16 left-5 z-20 flex flex-col gap-2 bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl text-white max-w-xs">
        <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
            Các dạng hình thái Vi khuẩn (SGK Bài 7)
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          {BACTERIA_SHAPES.map(shape => {
            const isCur = activeShape === shape.id;
            return (
              <button
                key={shape.id}
                onClick={() => handleSelectShape(shape.id)}
                className={`text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                  isCur
                    ? 'bg-blue-600 text-white shadow-md ring-1 ring-blue-300'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <span>{shape.vietnameseName}</span>
                <span className="text-[10px] opacity-75 font-mono">
                  {shape.id === 'bacillus' ? '1-4 µm' : shape.id === 'coccus' ? '0.8 µm' : shape.id === 'vibrio' ? '2 µm' : '10 µm'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Top-Right: Shape Detailed Scientific Info Card */}
      <div className="absolute top-16 right-5 z-20 w-84 bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl text-white space-y-2.5 text-xs">
        <div className="flex items-center justify-between pb-1 border-b border-white/10">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-white">{currentShapeInfo.vietnameseName}</h3>
            <span className="text-[10px] text-blue-300 font-mono">{currentShapeInfo.dimensions}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onSpeak(`${currentShapeInfo.vietnameseName}. Kích thước: ${currentShapeInfo.dimensions}. ${currentShapeInfo.description}. Đại diện tiêu biểu: ${currentShapeInfo.examples.join(', ')}.`);
            }}
            className={`p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors ${
              isSpeaking ? 'bg-emerald-500 text-white animate-pulse' : ''
            }`}
            title="Đọc thuyết minh hình thái vi khuẩn"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        <p className="text-slate-300 leading-relaxed text-xs">
          {currentShapeInfo.description}
        </p>

        <div className="p-2.5 bg-slate-950/70 rounded-xl border border-white/10 space-y-1">
          <span className="font-bold text-amber-300 block text-[11px]">Đại diện tiêu biểu:</span>
          <ul className="space-y-0.5 text-slate-300 list-disc list-inside text-[11px]">
            {currentShapeInfo.examples.map((ex, i) => (
              <li key={i}>{ex}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 5. Bottom Center Bar: Animation Play/Pause & Reset */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-2xl text-white">
        <button
          onClick={() => setIsSwimming(!isSwimming)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            isSwimming ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-800 text-slate-300'
          }`}
        >
          {isSwimming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isSwimming ? 'Tạm dừng chuyển động roi' : 'Tiếp tục bơi lội'}</span>
        </button>

        <button
          onClick={() => setShowLabels(!showLabels)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{showLabels ? 'Ẩn nhãn 3D' : 'Hiện nhãn 3D'}</span>
        </button>

        <button
          onClick={resetCamera}
          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          title="Đặt lại góc nhìn"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
