import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { PROKARYOTE_STRUCTURES } from '../data/biologyData';
import { ProkaryoteStructureId, ProkaryoteStructureDetail, MagnificationLevel } from '../types/biology';
import {
  Layers,
  ZoomIn,
  Eye,
  EyeOff,
  Sliders,
  Sparkles,
  Scissors,
  HelpCircle,
  Volume2,
  RotateCcw,
  Maximize,
  Minimize,
  Check,
  ChevronRight
} from 'lucide-react';

interface Prokaryote3DModelProps {
  onTargetClickedIn3D?: (structureId: ProkaryoteStructureId) => void;
  selectedStructureId: ProkaryoteStructureId | null;
  onSelectStructure: (structure: ProkaryoteStructureDetail | null) => void;
  isTeacherMode: boolean;
  onToggleTeacherMode: () => void;
  onOpenTasks: () => void;
}

export const Prokaryote3DModel: React.FC<Prokaryote3DModelProps> = ({
  onTargetClickedIn3D,
  selectedStructureId,
  onSelectStructure,
  isTeacherMode,
  onToggleTeacherMode,
  onOpenTasks
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Mesh Groups references
  const groupsRef = useRef<{ [key in ProkaryoteStructureId]?: THREE.Group }>({});
  const clickableMeshesRef = useRef<THREE.Mesh[]>([]);

  // Interactive UI states
  const [explosionDistance, setExplosionDistance] = useState<number>(0); // 0 to 100%
  const [magnificationLevel, setMagnificationLevel] = useState<MagnificationLevel>(1);
  const [isCutawayActive, setIsCutawayActive] = useState<boolean>(true); // Cross-section cut
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [isolatedStructureId, setIsolatedStructureId] = useState<ProkaryoteStructureId | null>(null);
  const [visibleParts, setVisibleParts] = useState<{ [key in ProkaryoteStructureId]: boolean }>({
    capsule: true,
    cell_wall: true,
    plasma_membrane: true,
    cytoplasm: true,
    ribosome: true,
    nucleoid: true,
    plasmid: true,
    flagellum: true,
    pili: true
  });

  // Handle normal structure selection (focus camera, open inspection card - just like Tab 1)
  const handleSelectStructure = useCallback((struct: ProkaryoteStructureDetail) => {
    if (selectedStructureId === struct.id) {
      onSelectStructure(null);
    } else {
      onSelectStructure(struct);
    }
  }, [selectedStructureId, onSelectStructure]);

  // Handle Solo Isolation: when clicking a label, ONLY that structure's model is displayed!
  const handleSelectSoloStructure = useCallback((struct: ProkaryoteStructureDetail) => {
    if (isolatedStructureId === struct.id) {
      // Toggle off -> restore all
      setIsolatedStructureId(null);
      onSelectStructure(null);
      setVisibleParts({
        capsule: true,
        cell_wall: true,
        plasma_membrane: true,
        cytoplasm: true,
        ribosome: true,
        nucleoid: true,
        plasmid: true,
        flagellum: true,
        pili: true
      });
    } else {
      // Isolate ONLY this clicked structure, hide all others!
      setIsolatedStructureId(struct.id);
      onSelectStructure(struct);
      const newVis: { [key in ProkaryoteStructureId]: boolean } = {
        capsule: false,
        cell_wall: false,
        plasma_membrane: false,
        cytoplasm: false,
        ribosome: false,
        nucleoid: false,
        plasmid: false,
        flagellum: false,
        pili: false
      };
      newVis[struct.id] = true;
      setVisibleParts(newVis);
    }
  }, [isolatedStructureId, onSelectStructure]);

  // Restore all structures
  const handleShowAllStructures = useCallback(() => {
    setIsolatedStructureId(null);
    onSelectStructure(null);
    setVisibleParts({
      capsule: true,
      cell_wall: true,
      plasma_membrane: true,
      cytoplasm: true,
      ribosome: true,
      nucleoid: true,
      plasmid: true,
      flagellum: true,
      pili: true
    });
  }, [onSelectStructure]);

  const handleSelectSoloStructureRef = useRef(handleSelectSoloStructure);
  handleSelectSoloStructureRef.current = handleSelectSoloStructure;

  // Auto-restore all structures when selection is cleared (e.g. card closed)
  useEffect(() => {
    if (!selectedStructureId && isolatedStructureId) {
      setIsolatedStructureId(null);
      setVisibleParts({
        capsule: true,
        cell_wall: true,
        plasma_membrane: true,
        cytoplasm: true,
        ribosome: true,
        nucleoid: true,
        plasmid: true,
        flagellum: true,
        pili: true
      });
    }
  }, [selectedStructureId, isolatedStructureId]);
  const [layerOpacity, setLayerOpacity] = useState({
    capsule: 0.65,
    cell_wall: 0.85,
    plasma_membrane: 0.95
  });

  // Screen 2D positions for floating labels in 3D
  const [labelCoords, setLabelCoords] = useState<{ [id: string]: { x: number; y: number; visible: boolean } }>({});

  // Camera targets for smooth lerp
  const targetCamPos = useRef(new THREE.Vector3(0, 8, 22));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  // Mouse Orbit controls state
  const isDragging = useRef(false);
  const previousMouse = useRef({ x: 0, y: 0 });

  // Reset Camera View
  const handleResetCamera = useCallback(() => {
    targetCamPos.current.set(0, 8, 22);
    targetLookAt.current.set(0, 0, 0);
    handleShowAllStructures();
    setMagnificationLevel(1);
    setExplosionDistance(0);
  }, [handleShowAllStructures]);

  // Handle Magnification Level Change
  const handleChangeMagnification = useCallback((level: MagnificationLevel) => {
    setMagnificationLevel(level);
    switch (level) {
      case 1: // Full Cell
        targetCamPos.current.set(0, 8, 22);
        targetLookAt.current.set(0, 0, 0);
        break;
      case 2: // Layers
        targetCamPos.current.set(0, 6, 15);
        targetLookAt.current.set(0, 0, 0);
        setExplosionDistance(45); // Automatically separate layers slightly
        break;
      case 3: // Cytoplasm & internal structures
        targetCamPos.current.set(0, 3, 9);
        targetLookAt.current.set(0, 0, 0);
        setIsCutawayActive(true);
        break;
      case 4: // Close up molecular complex (Ribosome/DNA)
        targetCamPos.current.set(0, 1.5, 4.5);
        targetLookAt.current.set(0, 0, 0);
        break;
    }
  }, []);

  // Sync explosion distance with 3D mesh offsets
  useEffect(() => {
    const factor = explosionDistance / 100;

    // 1. Layer 1: VỎ NHẦY (Capsule) + LÔNG (Pili) moves far right (+X)
    // Capsule total length is ~12.5. At factor = 1, center is at +34.
    if (groupsRef.current.capsule) {
      groupsRef.current.capsule.position.set(factor * 34, factor * 1.5, 0);
    }
    if (groupsRef.current.pili) {
      groupsRef.current.pili.position.set(factor * 34, factor * 1.5, 0);
    }

    // 2. Layer 2: THÀNH TẾ BÀO (Cell Wall - Peptidoglycan) moves moderately right (+X)
    // At factor = 1, center is at +17.
    // Left edge is at 17 - 5.9 = 11.1, while Capsule's left edge is at 34 - 6.3 = 27.7.
    // Gap between Capsule and Cell Wall is 5.2 units of empty space!
    if (groupsRef.current.cell_wall) {
      groupsRef.current.cell_wall.position.set(factor * 17, factor * 0.8, 0);
    }

    // 3. Layer 3: MÀNG SINH CHẤT (Plasma Membrane) + ROI (Flagellum) stays center
    // Center is at 0. Right edge is at +5.55.
    // Gap between Cell Wall (11.1) and Membrane (5.55) is 5.55 units of empty space!
    if (groupsRef.current.plasma_membrane) {
      groupsRef.current.plasma_membrane.position.set(0, 0, 0);
    }
    if (groupsRef.current.flagellum) {
      groupsRef.current.flagellum.position.set(0, 0, 0);
    }

    // 4. Layer 4: TẾ BÀO CHẤT (Cytoplasm) + RIBOSOME 70S + PLASMID moves moderately left (-X)
    // At factor = 1, center is at -17.
    // Right edge is at -17 + 5.25 = -11.75, while Membrane's left edge is at -5.55.
    // Gap between Membrane and Cytoplasm is 6.2 units of empty space!
    if (groupsRef.current.cytoplasm) {
      groupsRef.current.cytoplasm.position.set(-factor * 17, -factor * 0.8, 0);
    }
    if (groupsRef.current.ribosome) {
      // Slightly lift ribosomes so they are distinctly visible above the cytoplasm base
      groupsRef.current.ribosome.position.set(-factor * 17, -factor * 0.8 + factor * 2.2, factor * 1.0);
    }
    if (groupsRef.current.plasmid) {
      // Lower plasmids slightly so they don't overlap ribosomes
      groupsRef.current.plasmid.position.set(-factor * 17, -factor * 0.8 - factor * 1.8, factor * 1.0);
    }

    // 5. Layer 5: VÙNG NHÂN (Nucleoid DNA) moves far left (-X)
    // At factor = 1, center is at -34.
    // Right edge is at -34 + 2.5 = -31.5, while Cytoplasm left edge is at -22.25.
    // Gap between Cytoplasm and Nucleoid is 9.25 units of empty space!
    if (groupsRef.current.nucleoid) {
      groupsRef.current.nucleoid.position.set(-factor * 34, -factor * 1.5, 0);
    }

    // Camera choreography: if no structure is selected, smoothly expand camera FOV/distance
    // so that all 5 separated layers fit into the viewport.
    // If a structure is selected, focus camera directly on that separated structure!
    if (selectedStructureId) {
      const group = groupsRef.current[selectedStructureId];
      const pos = new THREE.Vector3();
      if (group) {
        group.getWorldPosition(pos);
      } else {
        if (selectedStructureId === 'capsule' || selectedStructureId === 'pili') {
          pos.set(factor * 34, factor * 1.5, 0);
        } else if (selectedStructureId === 'cell_wall') {
          pos.set(factor * 17, factor * 0.8, 0);
        } else if (selectedStructureId === 'cytoplasm') {
          pos.set(-factor * 17, -factor * 0.8, 0);
        } else if (selectedStructureId === 'ribosome') {
          pos.set(-factor * 17, -factor * 0.8 + factor * 2.2, factor * 1.0);
        } else if (selectedStructureId === 'plasmid') {
          pos.set(-factor * 17, -factor * 0.8 - factor * 1.8, factor * 1.0);
        } else if (selectedStructureId === 'nucleoid') {
          pos.set(-factor * 34, -factor * 1.5, 0);
        }
      }

      if (selectedStructureId === 'flagellum') {
        targetLookAt.current.set(pos.x - 4.5, pos.y, pos.z);
        targetCamPos.current.set(pos.x - 4.5, pos.y + 2.5, pos.z + 12);
      } else if (selectedStructureId === 'nucleoid') {
        targetLookAt.current.set(pos.x, pos.y, pos.z);
        targetCamPos.current.set(pos.x, pos.y + 1.8, pos.z + 8.5);
      } else if (selectedStructureId === 'ribosome') {
        targetLookAt.current.set(pos.x, pos.y, pos.z);
        targetCamPos.current.set(pos.x, pos.y + 1.5, pos.z + 6.5);
      } else if (selectedStructureId === 'plasmid') {
        targetLookAt.current.set(pos.x, pos.y, pos.z);
        targetCamPos.current.set(pos.x, pos.y + 1.2, pos.z + 6.5);
      } else if (selectedStructureId === 'pili') {
        targetLookAt.current.set(pos.x + 1.5, pos.y + 1.2, pos.z);
        targetCamPos.current.set(pos.x + 1.5, pos.y + 2.5, pos.z + 9);
      } else {
        // capsule, cell_wall, plasma_membrane, cytoplasm
        targetLookAt.current.set(pos.x, pos.y + 0.5, pos.z);
        targetCamPos.current.set(pos.x, pos.y + 2.2, pos.z + 10.5);
      }
    } else {
      const camY = 8 + factor * 6;
      const camZ = 22 + factor * 28; // From 22 back to 50
      targetCamPos.current.set(0, camY, camZ);
      targetLookAt.current.set(0, 0, 0);
    }
  }, [explosionDistance, selectedStructureId]);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // Deep slate obsidian background
    scene.fog = new THREE.FogExp2(0x0f172a, 0.012);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 8, 22);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(15, 25, 20);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    rimLight.position.set(-20, -10, -15);
    scene.add(rimLight);

    const bottomGlow = new THREE.PointLight(0xa855f7, 1.5, 30);
    bottomGlow.position.set(0, -5, 5);
    scene.add(bottomGlow);

    // 5. Floor Grid
    const grid = new THREE.GridHelper(100, 50, 0x1e293b, 0x0f172a);
    grid.position.y = -6;
    scene.add(grid);

    // 6. BUILD PROCEDURAL 3D BACTERIAL STRUCTURES
    clickableMeshesRef.current = [];
    const groups: { [key in ProkaryoteStructureId]?: THREE.Group } = {};

    // Helper: Register clickable mesh
    const registerClickable = (mesh: THREE.Mesh, id: ProkaryoteStructureId) => {
      mesh.userData = { structureId: id };
      clickableMeshesRef.current.push(mesh);
    };

    // --- A. VỎ NHẦY (Capsule) ---
    const capsuleGroup = new THREE.Group();
    capsuleGroup.name = 'capsule';
    // Capsule Geometry (Cutaway: thetaLength Math.PI * 1.5 when cutaway is on)
    const capsuleRadius = 3.2;
    const capsuleLength = 6.2;
    const capsuleGeo = new THREE.CapsuleGeometry(capsuleRadius, capsuleLength, 24, 32);
    const capsuleMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      roughness: 0.15,
      transmission: 0.6,
      ior: 1.35,
      depthWrite: false
    });
    const capsuleMesh = new THREE.Mesh(capsuleGeo, capsuleMat);
    capsuleMesh.rotation.z = Math.PI / 2;
    registerClickable(capsuleMesh, 'capsule');
    capsuleGroup.add(capsuleMesh);
    scene.add(capsuleGroup);
    groups.capsule = capsuleGroup;

    // --- B. THÀNH TẾ BÀO (Cell Wall - Peptidoglycan) ---
    const wallGroup = new THREE.Group();
    wallGroup.name = 'cell_wall';
    const wallGeo = new THREE.CapsuleGeometry(2.9, 6.0, 24, 32);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.4,
      metalness: 0.1,
      transparent: true,
      opacity: 0.75
    });
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.rotation.z = Math.PI / 2;
    registerClickable(wallMesh, 'cell_wall');
    wallGroup.add(wallMesh);
    scene.add(wallGroup);
    groups.cell_wall = wallGroup;

    // --- C. MÀNG SINH CHẤT (Plasma Membrane) ---
    const memGroup = new THREE.Group();
    memGroup.name = 'plasma_membrane';
    const memGeo = new THREE.CapsuleGeometry(2.65, 5.8, 24, 32);
    const memMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      roughness: 0.3,
      metalness: 0.2,
      transparent: true,
      opacity: 0.85
    });
    const memMesh = new THREE.Mesh(memGeo, memMat);
    memMesh.rotation.z = Math.PI / 2;
    registerClickable(memMesh, 'plasma_membrane');
    memGroup.add(memMesh);

    // Embedded Transport Proteins in membrane
    const proteinGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.4, 8);
    const proteinMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2 });
    for (let p = 0; p < 28; p++) {
      const prMesh = new THREE.Mesh(proteinGeo, proteinMat);
      const angle = (p / 28) * Math.PI * 2;
      const xPos = (Math.random() - 0.5) * 5.0;
      prMesh.position.set(Math.cos(angle) * 2.65, xPos, Math.sin(angle) * 2.65);
      prMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), prMesh.position.clone().normalize());
      memMesh.add(prMesh);
    }
    scene.add(memGroup);
    groups.plasma_membrane = memGroup;

    // --- D. TẾ BÀO CHẤT (Cytoplasm) ---
    const cytoGroup = new THREE.Group();
    cytoGroup.name = 'cytoplasm';
    const cytoGeo = new THREE.CapsuleGeometry(2.45, 5.6, 20, 24);
    const cytoMat = new THREE.MeshStandardMaterial({
      color: 0x4ade80,
      roughness: 0.5,
      transparent: true,
      opacity: 0.25,
      depthWrite: false
    });
    const cytoMesh = new THREE.Mesh(cytoGeo, cytoMat);
    cytoMesh.rotation.z = Math.PI / 2;
    registerClickable(cytoMesh, 'cytoplasm');
    cytoGroup.add(cytoMesh);
    scene.add(cytoGroup);
    groups.cytoplasm = cytoGroup;

    // --- E. RIBOSOME 70S ---
    const riboGroup = new THREE.Group();
    riboGroup.name = 'ribosome';
    const largeSubunitGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const smallSubunitGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const riboMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.3 });

    for (let r = 0; r < 90; r++) {
      const singleRibo = new THREE.Group();
      // Scatter within cytoplasm bounds
      const rX = (Math.random() - 0.5) * 5.0;
      const rY = (Math.random() - 0.5) * 3.6;
      const rZ = (Math.random() - 0.5) * 3.6;

      // Ensure inside cylinder
      if (Math.hypot(rY, rZ) < 2.1) {
        singleRibo.position.set(rX, rY, rZ);
        const largeMesh = new THREE.Mesh(largeSubunitGeo, riboMat);
        const smallMesh = new THREE.Mesh(smallSubunitGeo, riboMat);
        smallMesh.position.y = 0.12;
        singleRibo.add(largeMesh);
        singleRibo.add(smallMesh);
        registerClickable(largeMesh, 'ribosome');
        riboGroup.add(singleRibo);
      }
    }
    scene.add(riboGroup);
    groups.ribosome = riboGroup;

    // --- F. VÙNG NHÂN (Nucleoid DNA - Closed Circular Supercoiled DNA) ---
    const nucGroup = new THREE.Group();
    nucGroup.name = 'nucleoid';

    // Generate continuous supercoiled loop
    const curvePoints: THREE.Vector3[] = [];
    const numPoints = 80;
    for (let i = 0; i < numPoints; i++) {
      const theta = (i / numPoints) * Math.PI * 2;
      const mainRadiusX = 2.4;
      const mainRadiusY = 1.0;
      // High frequency wobble representing supercoiling
      const wobble = Math.sin(theta * 12) * 0.45;
      const wobbleZ = Math.cos(theta * 9) * 0.55;

      const px = Math.cos(theta) * (mainRadiusX + wobble);
      const py = Math.sin(theta) * (mainRadiusY + wobble * 0.6);
      const pz = wobbleZ;
      curvePoints.push(new THREE.Vector3(px, py, pz));
    }
    // Close the loop
    curvePoints.push(curvePoints[0].clone());

    const dnaCurve = new THREE.CatmullRomCurve3(curvePoints, true);
    const dnaTubeGeo = new THREE.TubeGeometry(dnaCurve, 180, 0.12, 8, true);
    const dnaMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0x7e22ce,
      emissiveIntensity: 0.7,
      roughness: 0.25,
      metalness: 0.2
    });
    const dnaMesh = new THREE.Mesh(dnaTubeGeo, dnaMat);
    dnaMesh.name = 'dna_mesh';
    registerClickable(dnaMesh, 'nucleoid');
    nucGroup.add(dnaMesh);
    scene.add(nucGroup);
    groups.nucleoid = nucGroup;

    // --- G. PLASMID DNA ---
    const plasGroup = new THREE.Group();
    plasGroup.name = 'plasmid';
    const plasMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.6,
      roughness: 0.2
    });

    // 2 plasmids floating in cytoplasm
    const plasOffsets = [
      new THREE.Vector3(2.2, -1.0, 0.8),
      new THREE.Vector3(-1.8, 1.2, -0.7)
    ];

    plasOffsets.forEach((pos, pIdx) => {
      const pTorusGeo = new THREE.TorusGeometry(0.5, 0.06, 8, 32);
      const pMesh = new THREE.Mesh(pTorusGeo, plasMat);
      pMesh.position.copy(pos);
      pMesh.rotation.set(Math.PI / 4 + pIdx, Math.PI / 3, 0);
      registerClickable(pMesh, 'plasmid');
      plasGroup.add(pMesh);
    });
    scene.add(plasGroup);
    groups.plasmid = plasGroup;

    // --- H. ROI (Flagellum) ---
    const flagGroup = new THREE.Group();
    flagGroup.name = 'flagellum';
    const flagMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.3,
      metalness: 0.1
    });

    // 3 flagella originating from one bacterial pole (-X)
    const flagellaMeshes: { mesh: THREE.Mesh; seed: number }[] = [];
    for (let f = 0; f < 3; f++) {
      const fPoints: THREE.Vector3[] = [];
      const startX = -5.8;
      const startY = (f - 1) * 0.4;
      const startZ = (f - 1) * 0.3;

      for (let s = 0; s < 40; s++) {
        const step = s * 0.3;
        fPoints.push(new THREE.Vector3(startX - step, startY, startZ));
      }
      const fCurve = new THREE.CatmullRomCurve3(fPoints);
      const fGeo = new THREE.TubeGeometry(fCurve, 40, 0.08, 8, false);
      const fMesh = new THREE.Mesh(fGeo, flagMat);
      fMesh.name = `flag_${f}`;
      registerClickable(fMesh, 'flagellum');
      flagGroup.add(fMesh);
      flagellaMeshes.push({ mesh: fMesh, seed: f });
    }
    scene.add(flagGroup);
    groups.flagellum = flagGroup;

    // --- I. LÔNG (Pili / Fimbriae) ---
    const piliGroup = new THREE.Group();
    piliGroup.name = 'pili';
    const piliGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.2, 6);
    const piliMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.8 });

    // Distribute 70 pili evenly across outer cylinder
    for (let pi = 0; pi < 70; pi++) {
      const pilus = new THREE.Mesh(piliGeo, piliMat);
      const theta = Math.random() * Math.PI * 2;
      const xPos = (Math.random() - 0.5) * 6.0;
      pilus.position.set(xPos, Math.cos(theta) * 3.3, Math.sin(theta) * 3.3);
      const normal = new THREE.Vector3(0, Math.cos(theta), Math.sin(theta)).normalize();
      pilus.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
      registerClickable(pilus, 'pili');
      piliGroup.add(pilus);
    }
    scene.add(piliGroup);
    groups.pili = piliGroup;

    groupsRef.current = groups;

    // 7. Mouse Orbit interaction
    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isDragging.current = true;
        previousMouse.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !cameraRef.current) return;
      const deltaX = e.clientX - previousMouse.current.x;
      const deltaY = e.clientY - previousMouse.current.y;

      const rotSpeed = 0.005;
      const offset = cameraRef.current.position.clone().sub(currentLookAt.current);
      const radius = offset.length();

      let theta = Math.atan2(offset.x, offset.z);
      let phi = Math.acos(Math.max(-1, Math.min(1, offset.y / radius)));

      theta -= deltaX * rotSpeed;
      phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi - deltaY * rotSpeed));

      offset.x = radius * Math.sin(phi) * Math.sin(theta);
      offset.y = radius * Math.cos(phi);
      offset.z = radius * Math.sin(phi) * Math.cos(theta);

      cameraRef.current.position.copy(currentLookAt.current).add(offset);
      targetCamPos.current.copy(cameraRef.current.position);

      previousMouse.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      const offset = cameraRef.current.position.clone().sub(currentLookAt.current);
      const zoomFactor = e.deltaY > 0 ? 1.08 : 0.92;
      const newLen = THREE.MathUtils.clamp(offset.length() * zoomFactor, 3.5, 45);
      offset.setLength(newLen);
      cameraRef.current.position.copy(currentLookAt.current).add(offset);
      targetCamPos.current.copy(cameraRef.current.position);
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });

    // 8. Raycast Click for structure inspection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(clickableMeshesRef.current, true);

      if (intersects.length > 0) {
        let hitObj: THREE.Object3D | null = intersects[0].object;
        while (hitObj && !hitObj.userData.structureId) {
          hitObj = hitObj.parent;
        }
        if (hitObj && hitObj.userData.structureId) {
          const structId = hitObj.userData.structureId as ProkaryoteStructureId;
          const found = PROKARYOTE_STRUCTURES.find(p => p.id === structId);
          if (found) {
            handleSelectSoloStructureRef.current(found);
            if (onTargetClickedIn3D) {
              onTargetClickedIn3D(structId);
            }
          }
        }
      }
    };
    domElement.addEventListener('click', onClick);

    // 9. Resize Handling
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 10. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera interpolation
      if (cameraRef.current) {
        cameraRef.current.position.lerp(targetCamPos.current, 0.08);
        currentLookAt.current.lerp(targetLookAt.current, 0.08);
        cameraRef.current.lookAt(currentLookAt.current);

        // Update 2D Label Screen Coordinates with distinct 3D anchor offsets
        const newCoords: { [id: string]: { x: number; y: number; visible: boolean } } = {};
        const tempVec = new THREE.Vector3();

        // 3D Anchor offsets for each structure matching anatomical positions:
        const structureAnchorOffsets: { [id: string]: { x: number; y: number; z: number } } = {
          pili: { x: 3.2, y: 3.6, z: 1.2 },
          capsule: { x: 1.0, y: 3.8, z: -1.2 },
          cell_wall: { x: -1.5, y: 3.5, z: 1.2 },
          plasma_membrane: { x: -3.2, y: 2.8, z: -1.0 },
          flagellum: { x: -7.5, y: 1.5, z: 0.5 },
          nucleoid: { x: 0.0, y: 0.8, z: 0.0 },
          ribosome: { x: 2.2, y: -1.0, z: 1.2 },
          plasmid: { x: -2.2, y: -1.6, z: 1.0 },
          cytoplasm: { x: 0.0, y: -2.6, z: -0.8 }
        };

        PROKARYOTE_STRUCTURES.forEach((struct: ProkaryoteStructureDetail) => {
          const group = groupsRef.current[struct.id];
          if (group && visibleParts[struct.id]) {
            group.getWorldPosition(tempVec);
            const offset = structureAnchorOffsets[struct.id] || { x: 0, y: 3.2, z: 0 };
            tempVec.x += offset.x;
            tempVec.y += offset.y;
            tempVec.z += offset.z;

            tempVec.project(cameraRef.current!);
            const isBehind = tempVec.z > 1;
            const xCoord = (tempVec.x * 0.5 + 0.5) * container.clientWidth;
            const yCoord = (-tempVec.y * 0.5 + 0.5) * container.clientHeight;

            newCoords[struct.id] = {
              x: xCoord,
              y: yCoord,
              visible: !isBehind && xCoord > 20 && xCoord < container.clientWidth - 20 && yCoord > 40 && yCoord < container.clientHeight - 40
            };
          }
        });

        // 2D Screen De-collision Pass:
        // Prevent any two visible badges from overlapping so the user can always see and click every badge
        const visibleStructs = PROKARYOTE_STRUCTURES.filter(s => newCoords[s.id]?.visible);
        visibleStructs.sort((a, b) => newCoords[a.id].y - newCoords[b.id].y);

        for (let i = 0; i < visibleStructs.length; i++) {
          for (let j = i + 1; j < visibleStructs.length; j++) {
            const idA = visibleStructs[i].id;
            const idB = visibleStructs[j].id;
            const posA = newCoords[idA];
            const posB = newCoords[idB];

            const dx = Math.abs(posA.x - posB.x);
            const dy = Math.abs(posA.y - posB.y);

            // Badge size footprint: ~125px width, ~32px height
            if (dx < 125 && dy < 34) {
              posB.y = posA.y + 36;
            }
          }
        }

        setLabelCoords(newCoords);
      }

      // --- ANIMATION 1: Wavy Propeller Flagella Motion ---
      flagellaMeshes.forEach(({ mesh, seed }) => {
        // Regenerate sine wave curve points dynamically
        const newPoints: THREE.Vector3[] = [];
        const startX = -5.8;
        const startY = (seed - 1) * 0.4;
        const startZ = (seed - 1) * 0.3;

        for (let s = 0; s < 40; s++) {
          const step = s * 0.3;
          const wavePhase = elapsedTime * 6 + s * 0.4 + seed * 2;
          const waveAmp = (s / 40) * 0.7; // Increases towards the tip
          newPoints.push(
            new THREE.Vector3(
              startX - step,
              startY + Math.sin(wavePhase) * waveAmp,
              startZ + Math.cos(wavePhase) * waveAmp
            )
          );
        }
        mesh.geometry.dispose();
        const newCurve = new THREE.CatmullRomCurve3(newPoints);
        mesh.geometry = new THREE.TubeGeometry(newCurve, 40, 0.08, 8, false);
      });

      // --- ANIMATION 2: Pulsing Glowing Nucleoid DNA ---
      if (groupsRef.current.nucleoid) {
        const dnaM = groupsRef.current.nucleoid.getObjectByName('dna_mesh') as THREE.Mesh;
        if (dnaM && dnaM.material) {
          const mat = dnaM.material as THREE.MeshStandardMaterial;
          mat.emissiveIntensity = 0.5 + Math.sin(elapsedTime * 3) * 0.3;
        }
      }

      // --- ANIMATION 3: Gentle Idle Floating & Ribosome activity ---
      if (groupsRef.current.plasmid) {
        groupsRef.current.plasmid.rotation.y = elapsedTime * 0.4;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('wheel', onWheel);
      domElement.removeEventListener('click', onClick);
      renderer.dispose();
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
    };
  }, []);

  // Update visibility of meshes
  useEffect(() => {
    Object.entries(visibleParts).forEach(([id, isVisible]) => {
      const g = groupsRef.current[id as ProkaryoteStructureId];
      if (g) g.visible = isVisible;
    });
  }, [visibleParts]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950" ref={containerRef}>
      {/* Top Banner when Solo Isolation Mode is Active */}
      {isolatedStructureId && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-amber-500/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-2xl text-slate-950 font-bold text-xs border border-amber-300 animate-in fade-in slide-in-from-top-4 duration-200">
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>
            Đang hiển thị riêng biệt: {PROKARYOTE_STRUCTURES.find(s => s.id === isolatedStructureId)?.vietnameseName} (Các cấu trúc khác đang ẩn)
          </span>
          <button
            onClick={handleShowAllStructures}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow transition-all cursor-pointer"
          >
            👁️ Hiện lại toàn bộ tế bào
          </button>
        </div>
      )}

      {/* 1. Floating 3D Structure Labels */}
      {showLabels &&
        PROKARYOTE_STRUCTURES.map((struct: ProkaryoteStructureDetail) => {
          // If a structure is isolated, temporarily hide all other labels!
          if (isolatedStructureId && isolatedStructureId !== struct.id) return null;

          const coords = labelCoords[struct.id];
          if (!coords || !coords.visible) return null;
          const isSolo = isolatedStructureId === struct.id;
          const isSelected = selectedStructureId === struct.id;

          return (
            <div
              key={struct.id}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectSoloStructure(struct);
              }}
              style={{
                transform: `translate(${coords.x}px, ${coords.y}px) translate(-50%, -100%)`,
                transition: 'opacity 0.2s ease, transform 0.05s linear'
              }}
              className="absolute left-0 top-0 cursor-pointer pointer-events-auto z-20 group"
            >
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xl backdrop-blur-md transition-all duration-200 border ${
                  isSolo || isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-300 scale-110 font-bold shadow-amber-500/30'
                    : 'bg-slate-900/85 hover:bg-slate-800 text-slate-100 border-white/20 hover:scale-105'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: struct.color }}
                />
                <span>{struct.vietnameseName}</span>
                {isSolo && (
                  <span className="text-[10px] bg-slate-950/20 px-1.5 py-0.5 rounded text-slate-950 font-bold ml-0.5">
                    (Click để hiện lại tất cả)
                  </span>
                )}
              </div>
              <div className="w-0.5 h-2.5 bg-white/40 mx-auto" />
            </div>
          );
        })}

      {/* 2. Top-Left: TÁCH LỚP (Explosion Slider) & CẮT LỚP (Cutaway) Controls */}
      <div className="absolute top-16 left-5 z-20 flex flex-col gap-2.5 bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl text-white max-w-xs">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Chế độ Tách lớp (Explode)</span>
          </span>
          <span className="text-xs font-mono font-bold text-blue-400">{explosionDistance}%</span>
        </div>

        {/* Explosion Range Slider */}
        <div className="space-y-1">
          <input
            type="range"
            min="0"
            max="100"
            value={explosionDistance}
            onChange={e => setExplosionDistance(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Nguyên vẹn (0%)</span>
            <span>Tách rời hoàn toàn (100%)</span>
          </div>
        </div>

        {/* Quick Explosion Presets */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button
            onClick={() => setExplosionDistance(0)}
            className={`py-1 text-[11px] font-semibold rounded-lg transition-colors ${
              explosionDistance === 0 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Nguyên vẹn
          </button>
          <button
            onClick={() => setExplosionDistance(45)}
            className={`py-1 text-[11px] font-semibold rounded-lg transition-colors ${
              explosionDistance === 45 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Tách vừa
          </button>
          <button
            onClick={() => setExplosionDistance(100)}
            className={`py-1 text-[11px] font-semibold rounded-lg transition-colors ${
              explosionDistance === 100 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Tách tối đa
          </button>
        </div>

        {/* Layer order indicator required by section IV */}
        <div className="mt-1 p-2 bg-slate-950/60 rounded-xl text-[10px] text-slate-300 space-y-1">
          <span className="font-bold text-blue-300 block">Thứ tự tách từ ngoài vào trong:</span>
          <p className="leading-relaxed">
            Vỏ nhầy → Thành tế bào → Màng sinh chất → Tế bào chất → Vùng nhân
          </p>
        </div>
      </div>

      {/* 3. Top-Right: PHÓNG ĐẠI CẤP ĐỘ (Magnification Levels 1 to 4) */}
      <div className="absolute top-16 right-5 z-20 flex flex-col gap-2 bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shadow-2xl text-white">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300 pb-1.5 border-b border-white/10">
          <ZoomIn className="w-4 h-4 text-emerald-400" />
          <span>Cấp độ Phóng đại</span>
        </div>

        <div className="flex flex-col gap-1.5">
          {[
            { level: 1 as MagnificationLevel, name: 'Cấp 1: Toàn bộ tế bào' },
            { level: 2 as MagnificationLevel, name: 'Cấp 2: Từng lớp vỏ bọc' },
            { level: 3 as MagnificationLevel, name: 'Cấp 3: Tế bào chất' },
            { level: 4 as MagnificationLevel, name: 'Cấp 4: Phân tử siêu hiển vi' }
          ].map(item => (
            <button
              key={item.level}
              onClick={() => handleChangeMagnification(item.level)}
              className={`text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                magnificationLevel === item.level
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400 font-bold'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Bottom-Left: Quản lý Ẩn/Hiện 9 cấu trúc bắt buộc */}
      <div className="absolute bottom-16 left-5 z-20 flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-2xl text-white max-h-56 overflow-y-auto w-64 no-scrollbar">
        <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
            Cấu trúc (Click để chỉ hiện)
          </span>
          {isolatedStructureId ? (
            <button
              onClick={handleShowAllStructures}
              className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-amber-500 text-slate-950"
            >
              Hiện tất cả
            </button>
          ) : (
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                showLabels ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'
              }`}
            >
              Nhãn: {showLabels ? 'Bật' : 'Tắt'}
            </button>
          )}
        </div>

        <div className="space-y-1">
          {PROKARYOTE_STRUCTURES.map((part: ProkaryoteStructureDetail) => {
            const isVis = visibleParts[part.id];
            const isSolo = isolatedStructureId === part.id;
            return (
              <div
                key={part.id}
                className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-white/5 text-xs"
              >
                <div
                  onClick={() => handleSelectSoloStructure(part)}
                  className="flex items-center gap-2 cursor-pointer flex-1 truncate"
                  title="Nhấn để chỉ hiển thị cấu trúc này"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: part.color }}
                  />
                  <span className={`truncate ${isSolo ? 'text-amber-400 font-bold' : selectedStructureId === part.id ? 'text-blue-400 font-bold' : 'text-slate-300'}`}>
                    {part.vietnameseName}
                  </span>
                  {isSolo && <span className="text-[10px] text-amber-300 shrink-0 font-mono">(Solo)</span>}
                </div>

                <button
                  onClick={() => setVisibleParts({ ...visibleParts, [part.id]: !isVis })}
                  className="text-slate-400 hover:text-white p-1"
                >
                  {isVis ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Center-Bottom: Fast Action Bar (Tasks launcher, Teacher Mode, Reset view) */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-2xl text-white">
        <button
          onClick={onOpenTasks}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Nhiệm vụ Tương tác (6 Dạng)</span>
        </button>

        <button
          onClick={onToggleTeacherMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            isTeacherMode
              ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
        >
          <span>Chế độ Giáo viên</span>
        </button>

        <button
          onClick={handleResetCamera}
          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          title="Đặt lại mô hình"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
