import * as THREE from 'three';

/**
 * Builds a high-fidelity, scientifically accurate 3D model of a Bacterium (Prokaryote / E. coli)
 * matching modern biology 3D representations (BioRender / Visible Body / Sketchfab):
 * - Anatomically proportioned rod capsule with hemispherical poles
 * - Distinct cutaway showing 3-layer envelope: Capsule -> Peptidoglycan Wall -> Plasma Membrane
 * - Internal cytoplasm matrix with supercoiled nucleoid DNA, 70S ribosomes, and plasmid rings
 * - Dense array of surface pili / fimbriae rooted on the envelope
 * - Helical corkscrew flagella rooted firmly in basal body hooks at the bacterial pole
 */

export interface BacteriumModelResult {
  group: THREE.Group;
  flagellaMeshes: THREE.Mesh[];
  updateFlagellaAnimation: (time: number) => void;
}

export function buildRealisticBacteriumModel(): BacteriumModelResult {
  const bacteriumGroup = new THREE.Group();
  bacteriumGroup.name = 'realistic_bacterium_group';

  // Dimensions of bacterium body along X axis
  const bodyRadius = 0.95;
  const cylinderLength = 2.4;
  const halfLen = cylinderLength / 2; // 1.2
  // Left pole is at x = -1.2 - 0.95 = -2.15
  // Right pole is at x = +1.2 + 0.95 = +2.15

  // -------------------------------------------------------------
  // 1. OUTER ENVELOPE: VỎ NHẦY (Capsule) & THÀNH TẾ BÀO & MÀNG SINH CHẤT
  // -------------------------------------------------------------

  // --- A. Capsule (Vỏ nhầy - Sky blue / cyan semi-translucent) ---
  // Create a 3/4 cutaway cylinder + hemispherical caps to reveal interior
  // thetaStart: Math.PI * 0.25, thetaLength: Math.PI * 1.5
  const capsuleMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.55,
    roughness: 0.15,
    metalness: 0.05,
    transmission: 0.45,
    ior: 1.33,
    depthWrite: false,
    side: THREE.DoubleSide
  });

  const capsuleGeo = new THREE.CapsuleGeometry(bodyRadius, cylinderLength, 24, 32);
  const capsuleMesh = new THREE.Mesh(capsuleGeo, capsuleMat);
  // CapsuleGeometry is oriented along Y by default -> rotate Z by 90deg to orient along X
  capsuleMesh.rotation.z = Math.PI / 2;
  capsuleMesh.castShadow = true;
  bacteriumGroup.add(capsuleMesh);

  // --- B. Cutaway Window revealing Peptidoglycan Wall & Plasma Membrane ---
  // Middle Wall: Peptidoglycan (Emerald green)
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x16a34a, // Emerald green
    roughness: 0.35,
    metalness: 0.1,
    side: THREE.DoubleSide
  });
  const wallGeo = new THREE.CylinderGeometry(bodyRadius * 0.92, bodyRadius * 0.92, cylinderLength * 0.85, 24, 1, true, Math.PI * 0.3, Math.PI * 0.85);
  const wallMesh = new THREE.Mesh(wallGeo, wallMat);
  wallMesh.rotation.z = Math.PI / 2;
  bacteriumGroup.add(wallMesh);

  // Inner Membrane: Plasma membrane (Golden Amber)
  const memMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b, // Warm gold
    roughness: 0.3,
    metalness: 0.15,
    side: THREE.DoubleSide
  });
  const memGeo = new THREE.CylinderGeometry(bodyRadius * 0.85, bodyRadius * 0.85, cylinderLength * 0.82, 24, 1, true, Math.PI * 0.35, Math.PI * 0.75);
  const memMesh = new THREE.Mesh(memGeo, memMat);
  memMesh.rotation.z = Math.PI / 2;
  bacteriumGroup.add(memMesh);

  // Cross section rim highlight (showing multilayer thickness)
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.2 });
  const rimGeo = new THREE.BoxGeometry(0.04, 0.12, cylinderLength * 0.8);
  const rim1 = new THREE.Mesh(rimGeo, rimMat);
  rim1.position.set(0, bodyRadius * 0.88, 0.45);
  rim1.rotation.y = Math.PI / 2;
  bacteriumGroup.add(rim1);

  // -------------------------------------------------------------
  // 2. CYTOPLASM MATRIX (Tế bào chất)
  // -------------------------------------------------------------
  const cytoGeo = new THREE.CapsuleGeometry(bodyRadius * 0.78, cylinderLength * 0.8, 16, 20);
  const cytoMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Deep ocean cyan
    roughness: 0.45,
    transparent: true,
    opacity: 0.38,
    depthWrite: false
  });
  const cytoMesh = new THREE.Mesh(cytoGeo, cytoMat);
  cytoMesh.rotation.z = Math.PI / 2;
  bacteriumGroup.add(cytoMesh);

  // -------------------------------------------------------------
  // 3. NUCLEOID DNA (Vùng nhân - Chuỗi ADN xoắn kép siêu cuộn)
  // -------------------------------------------------------------
  // Generate an intricate knot of circular closed or continuous tangled spline
  const dnaPoints: THREE.Vector3[] = [];
  const numDnaPoints = 28;
  for (let i = 0; i < numDnaPoints; i++) {
    const t = (i / numDnaPoints) * Math.PI * 2;
    // Lissajous-like 3D knot contained within the central cytoplasm volume
    const x = Math.sin(t) * 0.85 + Math.sin(t * 3) * 0.25;
    const y = Math.cos(t * 2) * 0.35 + Math.sin(t * 5) * 0.12;
    const z = Math.sin(t * 3) * 0.35 + Math.cos(t * 4) * 0.15;
    dnaPoints.push(new THREE.Vector3(x, y, z));
  }
  dnaPoints.push(dnaPoints[0].clone()); // Close loop

  const dnaCurve = new THREE.CatmullRomCurve3(dnaPoints, true);
  const dnaGeo = new THREE.TubeGeometry(dnaCurve, 80, 0.065, 8, true);
  const dnaMat = new THREE.MeshStandardMaterial({
    color: 0xa855f7, // Vibrant violet
    emissive: 0x7e22ce,
    emissiveIntensity: 0.65,
    roughness: 0.25,
    metalness: 0.2
  });
  const dnaMesh = new THREE.Mesh(dnaGeo, dnaMat);
  bacteriumGroup.add(dnaMesh);

  // Secondary DNA loop branch
  const dnaBranchPts: THREE.Vector3[] = [
    new THREE.Vector3(-0.4, 0.1, 0.1),
    new THREE.Vector3(-0.2, -0.2, 0.25),
    new THREE.Vector3(0.2, -0.15, -0.2),
    new THREE.Vector3(0.4, 0.2, 0.1),
    new THREE.Vector3(0.0, 0.3, -0.1),
    new THREE.Vector3(-0.4, 0.1, 0.1)
  ];
  const dnaBranchCurve = new THREE.CatmullRomCurve3(dnaBranchPts, true);
  const dnaBranchGeo = new THREE.TubeGeometry(dnaBranchCurve, 40, 0.05, 8, true);
  const dnaBranchMesh = new THREE.Mesh(dnaBranchGeo, dnaMat);
  bacteriumGroup.add(dnaBranchMesh);

  // -------------------------------------------------------------
  // 4. RIBOSOMES 70S (Hạt ribosome phân bố khắp tế bào chất)
  // -------------------------------------------------------------
  const riboMat = new THREE.MeshStandardMaterial({
    color: 0xf97316, // Vibrant amber-orange
    roughness: 0.2,
    metalness: 0.1
  });
  const riboGeo = new THREE.SphereGeometry(0.055, 8, 8);
  const riboGroup = new THREE.Group();

  // Distribute ~70 ribosomes within the cytoplasm bounds
  for (let i = 0; i < 75; i++) {
    const rx = (Math.random() - 0.5) * 2.0;
    const rAngle = Math.random() * Math.PI * 2;
    const rDist = Math.random() * (bodyRadius * 0.65);
    const ry = Math.cos(rAngle) * rDist;
    const rz = Math.sin(rAngle) * rDist;

    // Avoid colliding directly with center nucleoid
    if (Math.hypot(ry, rz) < 0.15 && Math.abs(rx) < 0.6) continue;

    const ribo = new THREE.Mesh(riboGeo, riboMat);
    ribo.position.set(rx, ry, rz);
    riboGroup.add(ribo);
  }
  bacteriumGroup.add(riboGroup);

  // -------------------------------------------------------------
  // 5. PLASMID RINGS (ADN vòng nhỏ phụ trợ)
  // -------------------------------------------------------------
  const plasmidMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4, // Cyan neon
    emissive: 0x0891b2,
    emissiveIntensity: 0.5,
    roughness: 0.2
  });
  const plasmidGeo = new THREE.TorusGeometry(0.24, 0.03, 8, 24);

  const plasmid1 = new THREE.Mesh(plasmidGeo, plasmidMat);
  plasmid1.position.set(0.75, -0.25, 0.2);
  plasmid1.rotation.set(0.4, 0.6, 0.2);
  bacteriumGroup.add(plasmid1);

  const plasmid2 = new THREE.Mesh(plasmidGeo, plasmidMat);
  plasmid2.position.set(-0.85, 0.22, -0.22);
  plasmid2.rotation.set(-0.5, 0.3, 0.8);
  bacteriumGroup.add(plasmid2);

  // -------------------------------------------------------------
  // 6. PILI / FIMBRIAE (Lông nhung / lông bám rải đều quanh bề mặt)
  // -------------------------------------------------------------
  // Pili are thin bristles firmly anchored in the capsule surface and radiating outwards
  const piliMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc, // Pale cyan bristle
    roughness: 0.35,
    metalness: 0.1
  });
  const pilusGeo = new THREE.CylinderGeometry(0.016, 0.012, 0.65, 6);
  const piliGroup = new THREE.Group();

  // Distribute ~80 pili evenly across cylinder body and hemispherical poles
  const numPili = 85;
  for (let i = 0; i < numPili; i++) {
    const isPole = Math.random() < 0.35;
    let surfacePos = new THREE.Vector3();
    let normal = new THREE.Vector3();

    if (!isPole) {
      // Cylinder surface
      const x = (Math.random() - 0.5) * cylinderLength * 0.95;
      const angle = Math.random() * Math.PI * 2;
      const ny = Math.cos(angle);
      const nz = Math.sin(angle);
      surfacePos.set(x, ny * bodyRadius, nz * bodyRadius);
      normal.set(0, ny, nz);
    } else {
      // Hemispherical caps
      const isRightPole = Math.random() > 0.5;
      const centerPoleX = isRightPole ? halfLen : -halfLen;
      // Spherical point
      const u = Math.random();
      const v = Math.random() * Math.PI * 2;
      const theta = Math.acos(u); // 0 to pi/2
      const phi = v;

      const px = Math.cos(theta) * (isRightPole ? 1 : -1);
      const py = Math.sin(theta) * Math.cos(phi);
      const pz = Math.sin(theta) * Math.sin(phi);

      normal.set(px, py, pz).normalize();
      surfacePos.set(centerPoleX + normal.x * bodyRadius, normal.y * bodyRadius, normal.z * bodyRadius);
    }

    const pilus = new THREE.Mesh(pilusGeo, piliMat);
    // Position half-length along normal so base is at the surface
    pilus.position.copy(surfacePos).addScaledVector(normal, 0.32);
    // Align cylinder (Y axis) with normal
    pilus.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
    piliGroup.add(pilus);
  }
  bacteriumGroup.add(piliGroup);

  // -------------------------------------------------------------
  // 7. FLAGELLA (Roi vi khuẩn - Gốc cắm tại cực vi khuẩn)
  // -------------------------------------------------------------
  // Located at the posterior pole: x = -halfLen - bodyRadius = -2.15
  const poleCenterX = -halfLen; // -1.2
  const poleTipX = poleCenterX - bodyRadius; // -2.15

  const flagellaMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8, // Sky blue flagella
    roughness: 0.3,
    metalness: 0.15
  });

  const basalMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Darker basal hook ring
    roughness: 0.3,
    metalness: 0.4
  });

  const flagellaMeshes: THREE.Mesh[] = [];
  const flagellaCurves: Array<{
    basePos: THREE.Vector3;
    curvePoints: THREE.Vector3[];
    mesh: THREE.Mesh;
    phaseOffset: number;
    spreadY: number;
    spreadZ: number;
  }> = [];

  // 3-4 helical flagella rooted in a lophotrichous polar cluster
  const flagellaConfigs = [
    { dy: 0.18, dz: 0.12, phase: 0.0, length: 5.5, pitch: 1.8, amp: 0.32 },
    { dy: -0.15, dz: 0.18, phase: 1.8, length: 5.8, pitch: 1.7, amp: 0.35 },
    { dy: 0.0, dz: -0.22, phase: 3.4, length: 5.2, pitch: 1.9, amp: 0.30 }
  ];

  flagellaConfigs.forEach((cfg, idx) => {
    // Exact root point on the hemispherical surface at the pole
    const rootPos = new THREE.Vector3(poleTipX + 0.08, cfg.dy, cfg.dz);

    // 1. Basal Body Hook collar (Thể gốc & Móc xoay)
    const hookGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.22, 10);
    const hook = new THREE.Mesh(hookGeo, basalMat);
    hook.position.copy(rootPos).add(new THREE.Vector3(-0.1, 0, 0));
    hook.rotation.z = Math.PI / 2;
    bacteriumGroup.add(hook);

    // 2. Initial points along helical path extending backwards along -X
    const pts: THREE.Vector3[] = [];
    const segments = 36;
    for (let s = 0; s <= segments; s++) {
      const frac = s / segments;
      const x = rootPos.x - frac * cfg.length;
      // Corkscrew helix expanding slightly with distance
      const envelope = Math.min(1, frac * 2.5);
      const angle = frac * (cfg.length / cfg.pitch) * Math.PI * 2 + cfg.phase;
      const y = cfg.dy + Math.sin(angle) * (cfg.amp * envelope);
      const z = cfg.dz + Math.cos(angle) * (cfg.amp * envelope);
      pts.push(new THREE.Vector3(x, y, z));
    }

    const curve = new THREE.CatmullRomCurve3(pts);
    const tubeGeo = new THREE.TubeGeometry(curve, 48, 0.048, 8, false);
    const flagMesh = new THREE.Mesh(tubeGeo, flagellaMat);
    flagMesh.castShadow = true;
    bacteriumGroup.add(flagMesh);

    flagellaMeshes.push(flagMesh);
    flagellaCurves.push({
      basePos: rootPos,
      curvePoints: pts,
      mesh: flagMesh,
      phaseOffset: cfg.phase,
      spreadY: cfg.dy,
      spreadZ: cfg.dz
    });
  });

  // Flagella wave animation updater function
  const updateFlagellaAnimation = (time: number) => {
    flagellaConfigs.forEach((cfg, idx) => {
      const item = flagellaCurves[idx];
      if (!item) return;

      const segments = 36;
      const newPts: THREE.Vector3[] = [];
      const waveSpeed = time * 5.0;

      for (let s = 0; s <= segments; s++) {
        const frac = s / segments;
        const x = item.basePos.x - frac * cfg.length;
        const envelope = Math.min(1, frac * 2.5);
        // Helical spinning wave
        const angle = frac * (cfg.length / cfg.pitch) * Math.PI * 2 + cfg.phase - waveSpeed;
        const y = cfg.dy + Math.sin(angle) * (cfg.amp * envelope);
        const z = cfg.dz + Math.cos(angle) * (cfg.amp * envelope);
        newPts.push(new THREE.Vector3(x, y, z));
      }

      const updatedCurve = new THREE.CatmullRomCurve3(newPts);
      const newGeo = new THREE.TubeGeometry(updatedCurve, 48, 0.048, 8, false);
      item.mesh.geometry.dispose();
      item.mesh.geometry = newGeo;
    });
  };

  return {
    group: bacteriumGroup,
    flagellaMeshes,
    updateFlagellaAnimation
  };
}
