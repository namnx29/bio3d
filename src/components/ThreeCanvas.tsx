import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { BIO_ENTITIES } from '../data/biologyData';
import { BioEntity } from '../types/biology';
import { buildProteinRibbonModel } from './ProteinRibbonModel';
import { buildRealisticBacteriumModel } from './BacteriumModelBuilder';
import { buildRealisticChloroplastModel } from './ChloroplastModelBuilder';
import { buildRealisticAnimalCellModel } from './AnimalCellModelBuilder';
import { buildRealisticPlantCellModel } from './PlantCellModelBuilder';

interface ThreeCanvasProps {
  selectedEntity: BioEntity | null;
  onSelectEntity: (entity: BioEntity | null) => void;
  showLabels: boolean;
  lightingMode: 'day' | 'fluorescent' | 'studio';
  onResetCameraReady: (resetFn: () => void) => void;
  onSliderFlyTo: (logPos: number) => void;
  sliderPos: number;
  activeModule: string;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  selectedEntity,
  onSelectEntity,
  showLabels,
  lightingMode,
  onResetCameraReady,
  sliderPos,
  activeModule
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Entities 3D meshes map for animations & raycasting
  const entityMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const clickableObjectsRef = useRef<THREE.Object3D[]>([]);

  // Smooth camera animation state
  const targetCamPos = useRef(new THREE.Vector3(0, 18, 48));
  const targetLookAt = useRef(new THREE.Vector3(0, 4, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 4, 0));
  const isTransitioning = useRef(false);

  // 2D screen positions for floating labels
  const [screenCoords, setScreenCoords] = useState<{ [id: string]: { x: number; y: number; visible: boolean } }>({});
  const [isolatedEntityId, setIsolatedEntityId] = useState<string | null>(null);

  // Sync isolated entity visibility
  useEffect(() => {
    entityMeshesRef.current.forEach((group, id) => {
      if (isolatedEntityId === null) {
        group.visible = true;
      } else {
        group.visible = (id === isolatedEntityId);
      }
    });
  }, [isolatedEntityId]);

  // Lighting references to adjust on mode change
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);

  // Mouse interaction state
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  const onSelectEntityRef = useRef(onSelectEntity);
  useEffect(() => {
    onSelectEntityRef.current = onSelectEntity;
  }, [onSelectEntity]);

  const onResetCameraReadyRef = useRef(onResetCameraReady);
  useEffect(() => {
    onResetCameraReadyRef.current = onResetCameraReady;
  }, [onResetCameraReady]);

  // Reset camera view to match image.png panorama
  const resetCamera = useCallback(() => {
    targetCamPos.current.set(1.0, 9.5, 48);
    targetLookAt.current.set(1.0, 4.2, 0);
    setIsolatedEntityId(null);
    isTransitioning.current = true;
  }, []);

  const handleToggleSoloEntity = useCallback((entity: BioEntity) => {
    if (isolatedEntityId === entity.id) {
      // Toggle off: unhide all entities, restore labels, and reset camera view!
      setIsolatedEntityId(null);
      resetCamera();
      if (onSelectEntityRef.current) {
        onSelectEntityRef.current(null);
      }
    } else {
      setIsolatedEntityId(entity.id);
      const [x, y, z] = entity.position3D;
      targetCamPos.current.set(x, y + 2.5, z + 9);
      targetLookAt.current.set(x, y, z);
      isTransitioning.current = true;
      if (onSelectEntityRef.current) {
        onSelectEntityRef.current(entity);
      }
    }
  }, [isolatedEntityId, resetCamera]);

  const handleToggleSoloEntityRef = useRef(handleToggleSoloEntity);
  useEffect(() => {
    handleToggleSoloEntityRef.current = handleToggleSoloEntity;
  }, [handleToggleSoloEntity]);

  useEffect(() => {
    if (onResetCameraReadyRef.current) {
      onResetCameraReadyRef.current(resetCamera);
    }
  }, [resetCamera]);

  // React to selected entity change
  const prevSelectedEntityIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (selectedEntity) {
      if (selectedEntity.id !== prevSelectedEntityIdRef.current) {
        prevSelectedEntityIdRef.current = selectedEntity.id;
        setIsolatedEntityId(selectedEntity.id);
        const [x, y, z] = selectedEntity.position3D;
        targetCamPos.current.set(x, y + 2.5, z + 9);
        targetLookAt.current.set(x, y, z);
        isTransitioning.current = true;
      }
    } else {
      prevSelectedEntityIdRef.current = null;
      if (isolatedEntityId !== null) {
        setIsolatedEntityId(null);
      }
      resetCamera();
    }
  }, [selectedEntity, resetCamera, isolatedEntityId]);

  // React to lighting mode change
  useEffect(() => {
    if (!sceneRef.current) return;
    if (lightingMode === 'day') {
      sceneRef.current.background = new THREE.Color(0xe2e8f0);
      if (ambientLightRef.current) ambientLightRef.current.intensity = 1.6;
      if (dirLightRef.current) {
        dirLightRef.current.color.set(0xffffff);
        dirLightRef.current.intensity = 1.8;
      }
    } else if (lightingMode === 'fluorescent') {
      sceneRef.current.background = new THREE.Color(0x0a0f1d);
      if (ambientLightRef.current) ambientLightRef.current.intensity = 0.5;
      if (dirLightRef.current) {
        dirLightRef.current.color.set(0x38bdf8);
        dirLightRef.current.intensity = 1.2;
      }
    } else {
      // studio
      sceneRef.current.background = new THREE.Color(0xdbe4ee);
      if (ambientLightRef.current) ambientLightRef.current.intensity = 1.3;
      if (dirLightRef.current) {
        dirLightRef.current.color.set(0xffedd5);
        dirLightRef.current.intensity = 2.2;
      }
    }
  }, [lightingMode]);

  // Main Three.js setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe2e8f0);
    scene.fog = new THREE.FogExp2(0xe2e8f0, 0.007);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(1.0, 9.5, 48);
    currentLookAt.current.set(1.0, 4.2, 0);
    targetCamPos.current.set(1.0, 9.5, 48);
    targetLookAt.current.set(1.0, 4.2, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.6);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xcfd8dc, 0.8);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(30, 45, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 150;
    dirLight.shadow.camera.left = -45;
    dirLight.shadow.camera.right = 45;
    dirLight.shadow.camera.top = 25;
    dirLight.shadow.camera.bottom = -25;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 0.9);
    rimLight.position.set(-30, 20, -30);
    scene.add(rimLight);

    // 5. Curved Ground / Dish Platform
    const floorGeo = new THREE.CylinderGeometry(85, 90, 4, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xedf2f7,
      roughness: 0.8,
      metalness: 0.1
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -3.2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Grid helper on floor for precision
    const grid = new THREE.GridHelper(90, 45, 0xcbd5e1, 0xe2e8f0);
    grid.position.y = -1.18;
    scene.add(grid);

    // 6. Build the 3D Scale Ruler Platform & Microscope Resolution Slabs
    buildScalePlatform(scene);

    // 7. Build Biological 3D Models
    buildBiologicalModels(scene, entityMeshesRef.current, clickableObjectsRef.current);

    // Helper: Texture generator for ruler texts
    function createTextCanvas(text: string, color: string, fontSize = 64, bgColor = 'transparent') {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext('2d')!;
      if (bgColor !== 'transparent') {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.fillStyle = color;
      ctx.font = `bold ${fontSize}px "Plus Jakarta Sans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      return new THREE.CanvasTexture(canvas);
    }

    function buildScalePlatform(targetScene: THREE.Scene) {
      // 1. Magenta/Pink Slab: "Kính hiển vi điện tử" (Electron Microscope)
      // Spans from X = -34.5 to X = 23.5 (Length = 58)
      const emWidth = 58;
      const emGeo = new THREE.BoxGeometry(emWidth, 1.4, 6.2);
      const emMat = new THREE.MeshStandardMaterial({
        color: 0xec4899, // Bright magenta pink matching reference image
        roughness: 0.35,
        metalness: 0.1
      });
      const emMesh = new THREE.Mesh(emGeo, emMat);
      emMesh.position.set(-5.5, -0.7, 0);
      emMesh.castShadow = true;
      emMesh.receiveShadow = true;
      targetScene.add(emMesh);

      // 2. Yellow/Gold Slab: "Kính hiển vi quang học" (Optical Microscope)
      // Starts right under 1 µm at X = 2.0, extends past 1 mm to X = 38.0 (Length = 36)
      const omWidth = 36;
      const omGeo = new THREE.BoxGeometry(omWidth, 1.3, 6.4);
      const omMat = new THREE.MeshStandardMaterial({
        color: 0xca8a04, // Golden yellow/mustard matching reference image
        roughness: 0.4,
        metalness: 0.15
      });
      const omMesh = new THREE.Mesh(omGeo, omMat);
      omMesh.position.set(20.0, -1.45, 1.5);
      omMesh.castShadow = true;
      omMesh.receiveShadow = true;
      targetScene.add(omMesh);

      // Label on EM slab front face: "Kính hiển vi điện tử" (bold black text, centered)
      const emLabelTex = createTextCanvas('Kính hiển vi điện tử', '#000000', 60);
      const emLabelGeo = new THREE.PlaneGeometry(18, 1.15);
      const emLabelMat = new THREE.MeshBasicMaterial({ map: emLabelTex, transparent: true });
      const emLabelMesh = new THREE.Mesh(emLabelGeo, emLabelMat);
      emLabelMesh.position.set(-5.5, -0.7, 3.12);
      targetScene.add(emLabelMesh);

      // Label on OM slab front face: "Kính hiển vi quang học" (bold black text, centered)
      const omLabelTex = createTextCanvas('Kính hiển vi quang học', '#000000', 60);
      const omLabelGeo = new THREE.PlaneGeometry(18, 1.15);
      const omLabelMat = new THREE.MeshBasicMaterial({ map: omLabelTex, transparent: true });
      const omLabelMesh = new THREE.Mesh(omLabelGeo, omLabelMat);
      omLabelMesh.position.set(20.0, -1.45, 4.72);
      targetScene.add(omLabelMesh);

      // 3. Scale graduation tick marks and numbers along the top edge:
      // Exactly matching image.png:
      // 0,1 nm (-32), 1 nm (-24), 10 nm (-16), 100 nm (-8), 1 µm (2), 10 µm (12), 100 µm (20), 100 µm (26), 1 mm (34)
      const scaleTicks = [
        { label: '0,1 nm', x: -32, y: 0.65, z: 3.12 },
        { label: '1 nm', x: -24, y: 0.65, z: 3.12 },
        { label: '10 nm', x: -16, y: 0.65, z: 3.12 },
        { label: '100 nm', x: -8, y: 0.65, z: 3.12 },
        { label: '1 µm', x: 2, y: 0.65, z: 3.12 },
        { label: '10 µm', x: 12, y: 0.65, z: 3.12 },
        { label: '100 µm', x: 20, y: 0.65, z: 3.12 },
        { label: '100 µm', x: 26, y: -0.1, z: 4.72 },
        { label: '1 mm', x: 34, y: -0.1, z: 4.72 }
      ];

      const tickMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const tickGeo = new THREE.BoxGeometry(0.2, 0.14, 1.0);

      scaleTicks.forEach(tick => {
        // Tick mark notch on top of slab edge
        const tickMesh = new THREE.Mesh(tickGeo, tickMat);
        const notchY = tick.y > 0 ? 0.05 : -0.75;
        tickMesh.position.set(tick.x, notchY, tick.z - 0.5);
        targetScene.add(tickMesh);

        // Standing upright billboard text in bold black
        const textTex = createTextCanvas(tick.label, '#000000', 74);
        const textPlaneGeo = new THREE.PlaneGeometry(3.6, 1.2);
        const textPlaneMat = new THREE.MeshBasicMaterial({ map: textTex, transparent: true });
        const textPlane = new THREE.Mesh(textPlaneGeo, textPlaneMat);
        textPlane.position.set(tick.x, tick.y, tick.z);
        targetScene.add(textPlane);
      });
    }

    // 8. Construct High-Fidelity Biological Models
    function buildBiologicalModels(
      targetScene: THREE.Scene,
      meshesMap: Map<string, THREE.Group>,
      clickableArr: THREE.Object3D[]
    ) {
      BIO_ENTITIES.forEach(entity => {
        const group = new THREE.Group();
        group.name = entity.id;
        const [x, y, z] = entity.position3D;
        group.position.set(x, y, z);

        // Click hit-box volume for responsive raycasting
        const hitBoxGeo = new THREE.SphereGeometry(2.8, 16, 16);
        const hitBoxMat = new THREE.MeshBasicMaterial({ visible: false, transparent: true, opacity: 0 });
        const hitBox = new THREE.Mesh(hitBoxGeo, hitBoxMat);
        hitBox.userData = { entityId: entity.id };
        group.add(hitBox);
        clickableArr.push(hitBox);

        // Model specific geometry
        switch (entity.modelType) {
          case 'atom': {
            // Central Nucleus: clustered protons & neutrons
            const nucleusGroup = new THREE.Group();
            const sphereGeo = new THREE.SphereGeometry(0.3, 16, 16);
            const protonMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2, metalness: 0.4 });
            const neutronMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.2, metalness: 0.4 });

            for (let i = 0; i < 14; i++) {
              const p = new THREE.Mesh(sphereGeo, i % 2 === 0 ? protonMat : neutronMat);
              p.position.set(
                (Math.random() - 0.5) * 0.7,
                (Math.random() - 0.5) * 0.7,
                (Math.random() - 0.5) * 0.7
              );
              nucleusGroup.add(p);
            }
            group.add(nucleusGroup);

            // Orbiting electron rings & electron beads
            const ringMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.6 });
            const electronMat = new THREE.MeshStandardMaterial({
              color: 0x38bdf8,
              emissive: 0x0284c7,
              emissiveIntensity: 0.8,
              roughness: 0.1
            });
            const electronGeo = new THREE.SphereGeometry(0.14, 12, 12);

            for (let r = 0; r < 3; r++) {
              const torusGeo = new THREE.TorusGeometry(1.6 + r * 0.4, 0.025, 8, 48);
              const torusMesh = new THREE.Mesh(torusGeo, ringMat);
              torusMesh.rotation.x = (r * Math.PI) / 3;
              torusMesh.rotation.y = (r * Math.PI) / 4;
              group.add(torusMesh);

              const electron = new THREE.Mesh(electronGeo, electronMat);
              electron.name = `electron_${r}`;
              torusMesh.add(electron);
            }
            break;
          }

          case 'amino_acid': {
            // Ball and Stick model (Alanine)
            const bondMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.5 });
            const cMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2, metalness: 0.3 }); // Carbon: black
            const oMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.2, metalness: 0.2 }); // Oxygen: red
            const nMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.2, metalness: 0.2 }); // Nitrogen: blue
            const hMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.1 }); // Hydrogen: white

            // Central Alpha Carbon
            const cAlpha = new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 20), cMat);
            group.add(cAlpha);

            // Carboxyl Group: C + =O + -OH
            const cCarb = new THREE.Mesh(new THREE.SphereGeometry(0.5, 18, 18), cMat);
            cCarb.position.set(-1.1, -0.6, 0);
            group.add(cCarb);

            const oDouble = new THREE.Mesh(new THREE.SphereGeometry(0.48, 18, 18), oMat);
            oDouble.position.set(-1.8, -0.2, 0.6);
            group.add(oDouble);

            const oSingle = new THREE.Mesh(new THREE.SphereGeometry(0.45, 18, 18), oMat);
            oSingle.position.set(-1.4, -1.8, -0.4);
            group.add(oSingle);

            // Amino Group: N + 2H
            const nAm = new THREE.Mesh(new THREE.SphereGeometry(0.52, 18, 18), nMat);
            nAm.position.set(1.0, -0.5, 0.4);
            group.add(nAm);

            const h1 = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), hMat);
            h1.position.set(1.6, -0.1, 0.9);
            group.add(h1);

            const h2 = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), hMat);
            h2.position.set(1.2, -1.3, 0.2);
            group.add(h2);

            // Side Chain (Methyl -CH3)
            const cSide = new THREE.Mesh(new THREE.SphereGeometry(0.48, 18, 18), cMat);
            cSide.position.set(0.1, 1.2, -0.2);
            group.add(cSide);

            // Bonds connecting atoms
            const createBond = (p1: THREE.Vector3, p2: THREE.Vector3, radius = 0.08) => {
              const dir = new THREE.Vector3().subVectors(p2, p1);
              const len = dir.length();
              const bondGeo = new THREE.CylinderGeometry(radius, radius, len, 12);
              const bond = new THREE.Mesh(bondGeo, bondMat);
              bond.position.copy(p1).addScaledVector(dir, 0.5);
              bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
              group.add(bond);
            };

            createBond(cAlpha.position, cCarb.position);
            createBond(cCarb.position, oDouble.position);
            createBond(cCarb.position, oSingle.position);
            createBond(cAlpha.position, nAm.position);
            createBond(nAm.position, h1.position);
            createBond(nAm.position, h2.position);
            createBond(cAlpha.position, cSide.position);
            break;
          }

          case 'protein': {
            // High-Fidelity 3D Cartoon Ribbon representation of Human Serum Albumin (HSA, PDB: 1E7H)
            // Matching the user's reference image:
            // - Coiled red alpha-helices with true ribbon thickness and width
            // - Thin green loops connecting the helices into a continuous polypeptide backbone
            // - Pearl-white & light-gray CPK spacefill spheres for bound fatty acid ligands inside pockets
            const proteinRibbonModel = buildProteinRibbonModel();
            proteinRibbonModel.scale.set(0.72, 0.72, 0.72);
            group.add(proteinRibbonModel);
            break;
          }

          case 'virus': {
            // Viral Capsid (Green sphere) with 60+ Red Spikes (Coronavirus aesthetic)
            const capsidGeo = new THREE.SphereGeometry(1.6, 24, 24);
            const capsidMat = new THREE.MeshStandardMaterial({
              color: 0x15803d,
              roughness: 0.6,
              bumpScale: 0.05
            });
            const capsid = new THREE.Mesh(capsidGeo, capsidMat);
            capsid.castShadow = true;
            group.add(capsid);

            // Spikes (Stem + Trimer Head)
            const spikeStemGeo = new THREE.CylinderGeometry(0.06, 0.09, 0.7, 8);
            const spikeHeadGeo = new THREE.ConeGeometry(0.24, 0.4, 8);
            const spikeMat = new THREE.MeshStandardMaterial({
              color: 0xdc2626,
              roughness: 0.3,
              metalness: 0.2
            });

            // Golden spiral distribution on sphere surface
            const numSpikes = 64;
            const phi = Math.PI * (3 - Math.sqrt(5)); // Golden ratio angle

            for (let i = 0; i < numSpikes; i++) {
              const yP = 1 - (i / (numSpikes - 1)) * 2;
              const radius = Math.sqrt(1 - yP * yP);
              const theta = phi * i;
              const xP = Math.cos(theta) * radius;
              const zP = Math.sin(theta) * radius;

              const normal = new THREE.Vector3(xP, yP, zP).normalize();
              const spikeHolder = new THREE.Group();
              spikeHolder.position.copy(normal.clone().multiplyScalar(1.6));
              spikeHolder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

              const stem = new THREE.Mesh(spikeStemGeo, spikeMat);
              stem.position.y = 0.35;
              const head = new THREE.Mesh(spikeHeadGeo, spikeMat);
              head.position.y = 0.8;
              head.rotation.x = Math.PI; // Inverted crown shape

              spikeHolder.add(stem);
              spikeHolder.add(head);
              group.add(spikeHolder);
            }
            break;
          }

          case 'bacteria': {
            // High-Fidelity, scientifically accurate 3D model of Bacterium (Prokaryote / E. coli)
            // - Multilayer envelope with 3/4 cutaway: Capsule (cyan) -> Peptidoglycan (green) -> Plasma membrane (gold)
            // - Cytoplasm with tangled nucleoid DNA (violet glow), 70S ribosomes (amber beads), and plasmid rings
            // - 85+ fine pili/fimbriae bristling uniformly across the capsule surface
            // - Helical flagella bundle firmly anchored into basal body hooks at the bacterial pole
            const bacData = buildRealisticBacteriumModel();
            bacData.group.scale.set(0.9, 0.9, 0.9);
            // Natural horizontal alignment with slight biological pitch
            bacData.group.rotation.set(0.08, -0.15, 0.05);
            group.add(bacData.group);

            // Store flagella animation updater on group userData
            group.userData.updateFlagella = bacData.updateFlagellaAnimation;
            break;
          }

          case 'chloroplast': {
            // High-Fidelity 3D model of Chloroplast (Lục lạp) matching user reference image:
            // - Dual membrane cutaway biconvex lens (dark glossy outer membrane, lime-yellow cut rim, lime stroma lining)
            // - 9 cylindrical Grana stacks of rounded thylakoid discs
            // - Intergranal thylakoid bridges (stromal lamellae)
            // - Circular chloroplast DNA rings and 70S ribosomes
            const chloroModel = buildRealisticChloroplastModel();
            chloroModel.scale.set(0.72, 0.72, 0.72);
            chloroModel.rotation.set(-0.2, 0.4, 0.1);
            group.add(chloroModel);
            break;
          }

          case 'animal_cell': {
            // High-Fidelity 3D model of Animal Cell (Tế bào động vật)
            // Strictly matching the user's reference Sketchfab model (te-bao-ong-vat-b7c3eb09beab49e4a4a250d08b331c20):
            // - Wavy salmon-pink/peach plasma membrane & fresh mint-green cytoplasm floor
            // - Nucleus with purple envelope, lavender nucleoplasm (1), and blue nucleolus (2)
            // - Concentric deep indigo rough ER (3) studded with pink ribosomes
            // - Coral-red Golgi apparatus (4) with secretory vesicles
            // - Cutaway mitochondrion (5) with orange folded cristae
            // - Smooth purple ER (6), yellow centrioles (perpendicular cylinders), and lysosomes
            // - Numbered circular badges (1 to 6) matching the Sketchfab model
            const animalCellModel = buildRealisticAnimalCellModel();
            animalCellModel.scale.set(0.68, 0.68, 0.68);
            group.add(animalCellModel);
            break;
          }

          case 'plant_cell': {
            // High-Fidelity 3D model of Plant Cell (Tế bào thực vật)
            // Strictly matching biological standards & Sinh học 10 curriculum:
            // - Rigid polygonal cellulose cell wall with layered cutaway & plasmodesmata channels
            // - Massive central vacuole (Không bào trung tâm) with tonoplast membrane & crystal inclusions
            // - Pushed-aside Nucleus (Nhân lệch tâm) with nucleoplasm & blue nucleolus
            // - Concentric Rough ER with pink ribosomes & branching Smooth ER
            // - 5 vivid Chloroplasts with Grana thylakoid stacks & intergranal bridges
            // - Cutaway Mitochondria with orange folded cristae & curved Golgi dictyosomes
            // - Educational numbered markers (1 to 7) for interactive learning
            const plantCellModel = buildRealisticPlantCellModel();
            plantCellModel.scale.set(0.65, 0.65, 0.65);
            group.add(plantCellModel);
            break;
          }

          case 'human_egg': {
            // Human Ovum (Large spherical mulberry-magenta cell matching reference image)
            const eggGeo = new THREE.SphereGeometry(1.35, 32, 32);
            const eggMat = new THREE.MeshStandardMaterial({
              color: 0x9d174d, // Vibrant mulberry / magenta-purple matching screenshot
              roughness: 0.45,
              metalness: 0.1
            });
            const eggMesh = new THREE.Mesh(eggGeo, eggMat);
            eggMesh.castShadow = true;
            group.add(eggMesh);

            // Translucent Zona Pellucida Shell
            const zonaGeo = new THREE.SphereGeometry(1.65, 24, 24);
            const zonaMat = new THREE.MeshPhysicalMaterial({
              color: 0xfbcfe8,
              transmission: 0.65,
              opacity: 0.45,
              transparent: true,
              roughness: 0.25,
              ior: 1.3
            });
            const zonaMesh = new THREE.Mesh(zonaGeo, zonaMat);
            group.add(zonaMesh);

            // Radiating Corona Radiata Cells
            const coronaGeo = new THREE.SphereGeometry(0.14, 8, 8);
            const coronaMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.4 });
            for (let cr = 0; cr < 32; cr++) {
              const cCell = new THREE.Mesh(coronaGeo, coronaMat);
              const phiC = Math.acos(-1 + (2 * cr) / 32);
              const thetaC = Math.sqrt(32 * Math.PI) * phiC;
              cCell.position.set(
                Math.cos(thetaC) * Math.sin(phiC) * 1.8,
                Math.sin(thetaC) * Math.sin(phiC) * 1.8,
                Math.cos(phiC) * 1.8
              );
              group.add(cCell);
            }
            break;
          }

          case 'frog_egg': {
            // Frog Egg: Two-toned sphere (Animal pole dark melanin / Vegetal pole creamy yellow)
            const frogGeo = new THREE.SphereGeometry(1.6, 32, 32);
            // Custom vertex colors for hemisphere split
            const frogCount = frogGeo.attributes.position.count;
            const frogColors = new Float32Array(frogCount * 3);
            const darkPole = new THREE.Color(0x0f172a); // Dark brown-black animal pole
            const lightPole = new THREE.Color(0xf1f5f9); // Pale whitish-cream vegetal pole

            for (let i = 0; i < frogCount; i++) {
              const yVal = frogGeo.attributes.position.getY(i);
              const factor = THREE.MathUtils.smoothstep(yVal, -0.3, 0.3);
              const finalCol = darkPole.clone().lerp(lightPole, 1 - factor);
              frogColors[i * 3] = finalCol.r;
              frogColors[i * 3 + 1] = finalCol.g;
              frogColors[i * 3 + 2] = finalCol.b;
            }
            frogGeo.setAttribute('color', new THREE.BufferAttribute(frogColors, 3));

            const frogMat = new THREE.MeshStandardMaterial({
              vertexColors: true,
              roughness: 0.25,
              metalness: 0.05
            });
            const frogMesh = new THREE.Mesh(frogGeo, frogMat);
            // Tilt dark animal pole towards camera matching image.png
            frogMesh.rotation.x = Math.PI * 0.4;
            frogMesh.castShadow = true;
            group.add(frogMesh);

            // Transparent Jelly Coat
            const jellyGeo = new THREE.SphereGeometry(2.05, 24, 24);
            const jellyMat = new THREE.MeshPhysicalMaterial({
              color: 0xe0f2fe,
              transmission: 0.85,
              transparent: true,
              opacity: 0.35,
              roughness: 0.1
            });
            const jellyMesh = new THREE.Mesh(jellyGeo, jellyMat);
            group.add(jellyMesh);
            break;
          }
        }

        targetScene.add(group);
        meshesMap.set(entity.id, group);
      });
    }

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

    // 10. Mouse Drag for Orbiting Scene
    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isDragging.current = true;
        previousMousePosition.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !cameraRef.current) return;
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      const rotSpeed = 0.005;
      const offset = cameraRef.current.position.clone().sub(currentLookAt.current);

      // Spherical coordinates rotation
      const radius = offset.length();
      let theta = Math.atan2(offset.x, offset.z);
      let phi = Math.acos(Math.max(-1, Math.min(1, offset.y / radius)));

      theta -= deltaX * rotSpeed;
      phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, phi - deltaY * rotSpeed));

      offset.x = radius * Math.sin(phi) * Math.sin(theta);
      offset.y = radius * Math.cos(phi);
      offset.z = radius * Math.sin(phi) * Math.cos(theta);

      cameraRef.current.position.copy(currentLookAt.current).add(offset);
      targetCamPos.current.copy(cameraRef.current.position);

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging.current = false;
    };

    // Wheel for zoom
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      const offset = cameraRef.current.position.clone().sub(currentLookAt.current);
      const zoomFactor = e.deltaY > 0 ? 1.08 : 0.92;
      const newLen = THREE.MathUtils.clamp(offset.length() * zoomFactor, 6, 90);
      offset.setLength(newLen);
      cameraRef.current.position.copy(currentLookAt.current).add(offset);
      targetCamPos.current.copy(cameraRef.current.position);
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });

    // 11. Click / Raycasting to select biological entity
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(clickableObjectsRef.current, true);

      if (intersects.length > 0) {
        let currentObj: THREE.Object3D | null = intersects[0].object;
        while (currentObj && !currentObj.userData.entityId) {
          currentObj = currentObj.parent;
        }
        if (currentObj && currentObj.userData.entityId) {
          const found = BIO_ENTITIES.find(b => b.id === currentObj!.userData.entityId);
          if (found) {
            handleToggleSoloEntityRef.current(found);
          }
        }
      }
    };
    domElement.addEventListener('click', onClick);

    // 12. Main Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera transition using lerp
      if (cameraRef.current) {
        cameraRef.current.position.lerp(targetCamPos.current, 0.08);
        currentLookAt.current.lerp(targetLookAt.current, 0.08);
        cameraRef.current.lookAt(currentLookAt.current);

        // Update 2D screen positions for floating HTML label tags
        const newCoords: { [id: string]: { x: number; y: number; visible: boolean } } = {};
        const tempVec = new THREE.Vector3();

        // Specific vertical offsets so label sits right above each model matching image.png
        const labelOffsets: { [id: string]: number } = {
          atom: 1.4,
          amino_acid: 1.9,
          protein: 2.6,
          virus: 1.9,
          chloroplast: 1.9,
          bacteria: 1.6,
          animal_cell: 2.6,
          plant_cell: 2.0,
          human_egg: 1.6,
          frog_egg: 2.1
        };

        BIO_ENTITIES.forEach(entity => {
          const meshGroup = entityMeshesRef.current.get(entity.id);
          if (meshGroup) {
            tempVec.copy(meshGroup.position);
            tempVec.y += labelOffsets[entity.id] || 2.2;
            tempVec.project(cameraRef.current!);

            const isBehind = tempVec.z > 1;
            const xCoord = (tempVec.x * 0.5 + 0.5) * container.clientWidth;
            const yCoord = (-tempVec.y * 0.5 + 0.5) * container.clientHeight;

            newCoords[entity.id] = {
              x: xCoord,
              y: yCoord,
              visible: !isBehind && xCoord > -50 && xCoord < container.clientWidth + 50
            };
          }
        });
        setScreenCoords(newCoords);
      }

      // Gentle biological animations (idle rotations, floating, electron spin)
      entityMeshesRef.current.forEach((group, id) => {
        // Subtle floating bob
        const floatOffset = Math.sin(elapsedTime * 1.5 + group.position.x * 0.5) * 0.005;
        group.position.y += floatOffset;

        // Specific rotations matching image.png orientations
        if (id === 'atom') {
          // Spin electrons
          const e0 = group.getObjectByName('electron_0');
          const e1 = group.getObjectByName('electron_1');
          const e2 = group.getObjectByName('electron_2');
          if (e0) e0.position.set(Math.cos(elapsedTime * 4) * 1.6, Math.sin(elapsedTime * 4) * 1.6, 0);
          if (e1) e1.position.set(Math.cos(elapsedTime * 3.5) * 2.0, Math.sin(elapsedTime * 3.5) * 2.0, 0);
          if (e2) e2.position.set(Math.cos(elapsedTime * 3) * 2.4, Math.sin(elapsedTime * 3) * 2.4, 0);
        } else if (id === 'protein') {
          group.rotation.y = elapsedTime * 0.12;
        } else if (id === 'bacteria') {
          group.rotation.y = Math.sin(elapsedTime * 0.4) * 0.08;
          if (group.userData.updateFlagella) {
            group.userData.updateFlagella(elapsedTime);
          }
        } else if (id === 'chloroplast' || id === 'animal_cell' || id === 'plant_cell') {
          // Subtle gentle sway keeping cutaway interior always facing camera as in image.png
          group.rotation.y = Math.sin(elapsedTime * 0.4 + group.position.x) * 0.08;
        }
      });

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

  return (
    <div className="relative w-full h-full overflow-hidden select-none" ref={containerRef}>
      {/* Top Banner when Solo Entity Mode is Active */}
      {isolatedEntityId && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-amber-500/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-2xl text-slate-950 font-bold text-xs border border-amber-300 animate-in fade-in slide-in-from-top-4 duration-200">
          <span>
            Đang hiển thị riêng biệt: {BIO_ENTITIES.find(e => e.id === isolatedEntityId)?.vietnameseName} ({BIO_ENTITIES.find(e => e.id === isolatedEntityId)?.scaleLabel}) — Các đối tượng khác đang tạm ẩn
          </span>
          <button
            onClick={() => {
              setIsolatedEntityId(null);
              resetCamera();
              if (onSelectEntityRef.current) {
                onSelectEntityRef.current(null);
              }
            }}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow transition-all cursor-pointer"
          >
            👁️ Hiện lại tất cả
          </button>
        </div>
      )}

      {/* Floating 3D/2D Screen Labels attached to each biological entity */}
      {showLabels &&
        BIO_ENTITIES.map(entity => {
          // If an entity is isolated, temporarily hide all other labels!
          if (isolatedEntityId && isolatedEntityId !== entity.id) return null;

          const coords = screenCoords[entity.id];
          if (!coords || !coords.visible) return null;
          const isSolo = isolatedEntityId === entity.id;
          const isSelected = selectedEntity?.id === entity.id;

          return (
            <div
              key={entity.id}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleSoloEntity(entity);
              }}
              style={{
                transform: `translate(${coords.x}px, ${coords.y}px) translate(-50%, -100%)`,
                transition: 'opacity 0.2s ease, transform 0.05s linear'
              }}
              className="absolute left-0 top-0 cursor-pointer pointer-events-auto z-10 group"
            >
              {/* Badge strictly matching image.png */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg backdrop-blur-md transition-all duration-200 border ${
                  isSolo || isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-300 scale-110'
                    : 'bg-black/75 hover:bg-black/90 text-white border-white/20 hover:scale-105'
                }`}
              >
                <span>{entity.vietnameseName}</span>
                {isSolo && (
                  <span className="text-[10px] bg-slate-950/20 px-1 py-0.5 rounded text-slate-950 font-bold ml-0.5">
                    (Click để hiện lại tất cả)
                  </span>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
};
