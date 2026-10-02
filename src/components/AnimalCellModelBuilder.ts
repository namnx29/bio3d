import * as THREE from 'three';

/**
 * Builds a high-fidelity 3D model of an Animal Cell (Tế bào động vật)
 * strictly matching the Sketchfab 3D model (te-bao-ong-vat-b7c3eb09beab49e4a4a250d08b331c20):
 * - Organic wavy salmon-pink/peach plasma membrane border
 * - Mint-green/teal smooth cytoplasm floor
 * - Upper-center cutaway Nucleus with purple envelope, lavender nucleoplasm (1), and blue nucleolus (2)
 * - Concentric deep indigo Rough Endoplasmic Reticulum (3) studded with pink ribosomes
 * - Smooth purple tubular Endoplasmic Reticulum (6) with branching channels
 * - Watermelon-red crescent folded Golgi Apparatus (4) with secretory vesicles
 * - Cutaway Mitochondrion (5) with purple outer shell and orange folded cristae
 * - Bright yellow Centrioles (pair of perpendicular cylinders)
 * - Yellow Lysosomes & blue vesicles
 * - Circular numbered markers (1 to 6) exactly matching the Sketchfab educational model
 */

export function buildRealisticAnimalCellModel(): THREE.Group {
  const cellGroup = new THREE.Group();
  cellGroup.name = 'sketchfab_animal_cell_group';

  // -------------------------------------------------------------
  // 1. PLASMA MEMBRANE & CYTOPLASM BASE (Màng sinh chất & Tế bào chất)
  // -------------------------------------------------------------
  // Organic wavy boundary matching Sketchfab model
  const numPerimPoints = 48;
  const perimPoints: THREE.Vector3[] = [];
  const baseRadius = 3.4;

  for (let i = 0; i <= numPerimPoints; i++) {
    const angle = (i / numPerimPoints) * Math.PI * 2;
    // Asymmetric organic cell perturbation
    const r = baseRadius +
      Math.sin(angle * 3) * 0.28 +
      Math.cos(angle * 2) * 0.22 +
      Math.sin(angle * 5) * 0.10;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * (r * 0.92);
    // Slight wavy edge in Y
    const y = Math.sin(angle * 4) * 0.06;
    perimPoints.push(new THREE.Vector3(x, y, z));
  }

  // A. Salmon-Pink / Peach Plasma Membrane Border (Thành màng ngoài)
  const perimCurve = new THREE.CatmullRomCurve3(perimPoints, true);
  const memGeo = new THREE.TubeGeometry(perimCurve, 64, 0.22, 12, true);
  const memMat = new THREE.MeshStandardMaterial({
    color: 0xf87171, // Salmon peach-coral
    roughness: 0.35,
    metalness: 0.08
  });
  const memMesh = new THREE.Mesh(memGeo, memMat);
  memMesh.castShadow = true;
  memMesh.receiveShadow = true;
  cellGroup.add(memMesh);

  // B. Cytoplasm Matrix Floor (Tế bào chất màu xanh bạc hà / mint-green)
  // Create an organic flat polygon/shape
  const shape = new THREE.Shape();
  perimPoints.slice(0, numPerimPoints).forEach((pt, idx) => {
    if (idx === 0) shape.moveTo(pt.x, pt.z);
    else shape.lineTo(pt.x, pt.z);
  });
  shape.closePath();

  const floorGeo = new THREE.ShapeGeometry(shape);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x6ee7b7, // Fresh mint-sage green
    roughness: 0.48,
    metalness: 0.02,
    side: THREE.DoubleSide
  });
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = Math.PI / 2;
  floorMesh.position.y = -0.05;
  floorMesh.receiveShadow = true;
  cellGroup.add(floorMesh);

  // Underside shallow dome (blush peach base)
  const underGeo = new THREE.SphereGeometry(3.3, 32, 16, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5);
  const underMat = new THREE.MeshStandardMaterial({
    color: 0xfca5a5,
    roughness: 0.5,
    side: THREE.BackSide
  });
  const underMesh = new THREE.Mesh(underGeo, underMat);
  underMesh.scale.set(1.0, 0.25, 0.95);
  underMesh.position.y = -0.15;
  cellGroup.add(underMesh);

  // -------------------------------------------------------------
  // 2. NUCLEUS (Nhân tế bào - Số 1: Dịch nhân, Số 2: Nhân con)
  // -------------------------------------------------------------
  const nucleusCenter = new THREE.Vector3(0.0, 0.25, -0.75);

  // A. Outer Nuclear Envelope (Màng nhân màu tím / violet với các lỗ nhân)
  const nucRadius = 1.15;
  const nucEnvMat = new THREE.MeshStandardMaterial({
    color: 0x6b21a8, // Deep royal purple
    roughness: 0.32,
    metalness: 0.12
  });
  // Top-cut cylinder rim for nuclear membrane
  const nucRimGeo = new THREE.CylinderGeometry(nucRadius, nucRadius, 0.45, 32, 1, true);
  const nucRim = new THREE.Mesh(nucRimGeo, nucEnvMat);
  nucRim.position.copy(nucleusCenter);
  cellGroup.add(nucRim);

  // Torus lip on nuclear rim
  const nucLipGeo = new THREE.TorusGeometry(nucRadius, 0.09, 8, 32);
  const nucLip = new THREE.Mesh(nucLipGeo, nucEnvMat);
  nucLip.rotation.x = Math.PI / 2;
  nucLip.position.set(nucleusCenter.x, nucleusCenter.y + 0.22, nucleusCenter.z);
  cellGroup.add(nucLip);

  // Tiny nuclear pores (lỗ nhân) in yellow
  const poreMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  const poreGeo = new THREE.SphereGeometry(0.04, 6, 6);
  for (let p = 0; p < 14; p++) {
    const a = (p / 14) * Math.PI * 2;
    const pore = new THREE.Mesh(poreGeo, poreMat);
    pore.position.set(
      nucleusCenter.x + Math.cos(a) * nucRadius,
      nucleusCenter.y + 0.22,
      nucleusCenter.z + Math.sin(a) * nucRadius
    );
    cellGroup.add(pore);
  }

  // B. Nucleoplasm (Số 1: Dịch nhân - Mặt phẳng hồng/magenta sáng)
  const nucleoplasmMat = new THREE.MeshStandardMaterial({
    color: 0xf472b6, // Bright lavender-pink
    roughness: 0.25,
    metalness: 0.08
  });
  const nucFloorGeo = new THREE.CylinderGeometry(nucRadius * 0.95, nucRadius * 0.95, 0.12, 32);
  const nucFloor = new THREE.Mesh(nucFloorGeo, nucleoplasmMat);
  nucFloor.position.set(nucleusCenter.x, nucleusCenter.y + 0.16, nucleusCenter.z);
  cellGroup.add(nucFloor);

  // C. Nucleolus (Số 2: Nhân con - Cụm tròn màu xanh lam/indigo ở trung tâm)
  const nucleolusMat = new THREE.MeshStandardMaterial({
    color: 0x2563eb, // Vibrant royal blue
    roughness: 0.5,
    metalness: 0.1
  });
  // Tangled fibrous appearance using multiple overlapping spheres
  const nucleolusGroup = new THREE.Group();
  nucleolusGroup.position.set(nucleusCenter.x + 0.08, nucleusCenter.y + 0.32, nucleusCenter.z);

  const mainNucGeo = new THREE.SphereGeometry(0.36, 16, 16);
  nucleolusGroup.add(new THREE.Mesh(mainNucGeo, nucleolusMat));

  for (let b = 0; b < 12; b++) {
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), nucleolusMat);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const dist = 0.28 + Math.random() * 0.1;
    bead.position.set(
      Math.sin(phi) * Math.cos(theta) * dist,
      Math.cos(phi) * dist * 0.7,
      Math.sin(phi) * Math.sin(theta) * dist
    );
    nucleolusGroup.add(bead);
  }
  cellGroup.add(nucleolusGroup);

  // -------------------------------------------------------------
  // 3. ROUGH ENDOPLASMIC RETICULUM (Số 3: Lưới nội chất hạt)
  // -------------------------------------------------------------
  // Concentric folded sheets wrapping around the nucleus
  const roughErMat = new THREE.MeshStandardMaterial({
    color: 0x3730a3, // Deep indigo-blue
    roughness: 0.35,
    metalness: 0.12
  });

  const riboPinkMat = new THREE.MeshStandardMaterial({
    color: 0xf43f5e, // Bright pink/coral ribosomes
    roughness: 0.2,
    metalness: 0.1
  });
  const riboPinkGeo = new THREE.SphereGeometry(0.042, 8, 8);

  // 4 tiered concentric wavy ribbons
  const roughErRadii = [1.45, 1.85, 2.25, 2.65];
  const roughErAngles = [
    { start: Math.PI * 0.05, end: Math.PI * 0.95 },
    { start: Math.PI * 0.0, end: Math.PI * 1.05 },
    { start: Math.PI * 0.1, end: Math.PI * 0.9 },
    { start: Math.PI * 0.2, end: Math.PI * 0.8 }
  ];

  roughErRadii.forEach((rad, rIdx) => {
    const arc = roughErAngles[rIdx];
    const pts: THREE.Vector3[] = [];
    const steps = 32;

    for (let s = 0; s <= steps; s++) {
      const frac = s / steps;
      const angle = arc.start + frac * (arc.end - arc.start);
      // Wavy sinusoidal fold
      const wave = Math.sin(frac * Math.PI * 6 + rIdx) * 0.14;
      const curR = rad + wave;
      const x = nucleusCenter.x + Math.cos(angle) * curR;
      const z = nucleusCenter.z + Math.sin(angle) * (curR * 0.95);
      const y = nucleusCenter.y + 0.12 + Math.sin(frac * Math.PI * 4) * 0.05;
      pts.push(new THREE.Vector3(x, y, z));
    }

    const curve = new THREE.CatmullRomCurve3(pts);
    const tubeGeo = new THREE.TubeGeometry(curve, 36, 0.085, 8, false);
    const tubeMesh = new THREE.Mesh(tubeGeo, roughErMat);
    tubeMesh.castShadow = true;
    cellGroup.add(tubeMesh);

    // Dotted with pink ribosomes attached along the fold
    for (let rb = 0; rb < 22; rb++) {
      const tVal = (rb + 0.5) / 22;
      const ptOnCurve = curve.getPoint(tVal);
      const ribo = new THREE.Mesh(riboPinkGeo, riboPinkMat);
      ribo.position.copy(ptOnCurve).add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.12,
        0.08,
        (Math.random() - 0.5) * 0.12
      ));
      cellGroup.add(ribo);
    }
  });

  // -------------------------------------------------------------
  // 4. SMOOTH ENDOPLASMIC RETICULUM (Số 6: Lưới nội chất trơn)
  // -------------------------------------------------------------
  // Branching tubular pipes in vibrant purple on the lower left
  const smoothErMat = new THREE.MeshStandardMaterial({
    color: 0x9333ea, // Vibrant purple
    roughness: 0.3,
    metalness: 0.12
  });

  const smoothErPipes = [
    // Pipe 1: Loop
    [new THREE.Vector3(-1.3, 0.1, 0.2), new THREE.Vector3(-1.7, 0.28, 0.1), new THREE.Vector3(-2.1, 0.2, 0.4)],
    // Pipe 2: Anastomosis
    [new THREE.Vector3(-2.1, 0.2, 0.4), new THREE.Vector3(-1.8, 0.35, 0.7), new THREE.Vector3(-1.4, 0.22, 0.8)],
    // Pipe 3: Branching loop
    [new THREE.Vector3(-1.4, 0.22, 0.8), new THREE.Vector3(-1.1, 0.15, 0.5), new THREE.Vector3(-1.3, 0.1, 0.2)],
    // Pipe 4: Upward extension
    [new THREE.Vector3(-1.7, 0.28, 0.1), new THREE.Vector3(-1.5, 0.42, 0.4), new THREE.Vector3(-1.8, 0.35, 0.7)],
    // Pipe 5: Open socket
    [new THREE.Vector3(-1.1, 0.15, 0.5), new THREE.Vector3(-0.8, 0.25, 0.7), new THREE.Vector3(-0.6, 0.15, 0.9)]
  ];

  smoothErPipes.forEach(pipe => {
    const curve = new THREE.CatmullRomCurve3(pipe);
    const geo = new THREE.TubeGeometry(curve, 18, 0.09, 8, false);
    const mesh = new THREE.Mesh(geo, smoothErMat);
    mesh.castShadow = true;
    cellGroup.add(mesh);
  });

  // Hollow socket collars on smooth ER
  const collarGeo = new THREE.TorusGeometry(0.09, 0.03, 6, 16);
  const collar1 = new THREE.Mesh(collarGeo, smoothErMat);
  collar1.position.set(-0.6, 0.15, 0.9);
  collar1.rotation.y = Math.PI / 3;
  cellGroup.add(collar1);

  // -------------------------------------------------------------
  // 5. GOLGI APPARATUS (Số 4: Bộ máy Golgi)
  // -------------------------------------------------------------
  // Stack of 5-6 curved crescent cisternae on the right in vivid watermelon-red
  const golgiMat = new THREE.MeshStandardMaterial({
    color: 0xef4444, // Vibrant coral / watermelon red
    roughness: 0.28,
    metalness: 0.1
  });

  const golgiCenter = new THREE.Vector3(1.75, 0.22, 0.45);
  const numGolgiCisternae = 5;

  for (let g = 0; g < numGolgiCisternae; g++) {
    const pts: THREE.Vector3[] = [];
    const spreadX = (g - 2) * 0.16;
    const rad = 0.95 - Math.abs(g - 2) * 0.08;

    for (let s = 0; s <= 16; s++) {
      const frac = s / 16;
      const angle = -Math.PI * 0.45 + frac * Math.PI * 0.9;
      // Crescent bow curve
      const gx = golgiCenter.x + spreadX + Math.sin(angle) * (rad * 0.45);
      const gz = golgiCenter.z + Math.cos(angle) * rad;
      const gy = golgiCenter.y + 0.06 + Math.sin(frac * Math.PI) * 0.08;
      pts.push(new THREE.Vector3(gx, gy, gz));
    }

    const curve = new THREE.CatmullRomCurve3(pts);
    const geo = new THREE.TubeGeometry(curve, 20, 0.08, 8, false);
    const mesh = new THREE.Mesh(geo, golgiMat);
    mesh.castShadow = true;
    cellGroup.add(mesh);

    // Swollen bulbous ends
    const bulbGeo = new THREE.SphereGeometry(0.12, 10, 10);
    const bulbStart = new THREE.Mesh(bulbGeo, golgiMat);
    bulbStart.position.copy(pts[0]);
    cellGroup.add(bulbStart);

    const bulbEnd = new THREE.Mesh(bulbGeo, golgiMat);
    bulbEnd.position.copy(pts[pts.length - 1]);
    cellGroup.add(bulbEnd);
  }

  // Detached secretory vesicles around Golgi
  const vesicleGeo = new THREE.SphereGeometry(0.09, 8, 8);
  const vesiclePositions = [
    new THREE.Vector3(1.2, 0.2, 0.6),
    new THREE.Vector3(2.4, 0.22, 0.1),
    new THREE.Vector3(2.45, 0.25, 0.8),
    new THREE.Vector3(1.4, 0.24, -0.3)
  ];
  vesiclePositions.forEach(vp => {
    const vMesh = new THREE.Mesh(vesicleGeo, golgiMat);
    vMesh.position.copy(vp);
    cellGroup.add(vMesh);
  });

  // -------------------------------------------------------------
  // 6. MITOCHONDRIA (Số 5: Ty thể có màng trong gấp nếp Cristae)
  // -------------------------------------------------------------
  // Large cutaway mitochondrion at bottom center
  const mitoGroup = new THREE.Group();
  mitoGroup.position.set(0.2, 0.2, 1.25);
  mitoGroup.rotation.y = 0.25;

  const mitoOuterMat = new THREE.MeshStandardMaterial({
    color: 0x6366f1, // Purple-indigo outer membrane
    roughness: 0.3,
    metalness: 0.1
  });
  const mitoInnerMat = new THREE.MeshStandardMaterial({
    color: 0xf97316, // Vibrant orange cristae folds
    roughness: 0.35,
    metalness: 0.08
  });

  // Cutaway half-capsule shell
  const mitoShellGeo = new THREE.CapsuleGeometry(0.32, 0.85, 12, 16);
  const mitoShell = new THREE.Mesh(mitoShellGeo, mitoOuterMat);
  mitoShell.rotation.z = Math.PI / 2;
  mitoShell.scale.set(1.0, 1.0, 0.55); // Flat cutaway face
  mitoGroup.add(mitoShell);

  // Inner folded cristae ridges (orange zig-zag)
  for (let c = 0; c < 5; c++) {
    const cx = -0.35 + c * 0.18;
    const cristaGeo = new THREE.BoxGeometry(0.06, 0.22, 0.24);
    const crista = new THREE.Mesh(cristaGeo, mitoInnerMat);
    crista.position.set(cx, 0.02, 0.05);
    crista.rotation.y = (c % 2 === 0 ? 1 : -1) * 0.3;
    mitoGroup.add(crista);
  }
  cellGroup.add(mitoGroup);

  // Intact secondary mitochondria on upper right & left
  const intactMitoGeo = new THREE.CapsuleGeometry(0.24, 0.65, 10, 12);
  const mito2 = new THREE.Mesh(intactMitoGeo, mitoOuterMat);
  mito2.position.set(1.9, 0.2, -1.1);
  mito2.rotation.set(0.4, 0.8, 0.2);
  cellGroup.add(mito2);

  const mito3 = new THREE.Mesh(intactMitoGeo, mitoOuterMat);
  mito3.position.set(-2.4, 0.18, -0.4);
  mito3.rotation.set(-0.3, 0.6, 0.5);
  cellGroup.add(mito3);

  // -------------------------------------------------------------
  // 7. CENTROSOME / CENTRIOLES (Trung thể - 2 trung tử xếp góc 90 độ)
  // -------------------------------------------------------------
  const centrioleMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15, // Bright yellow
    roughness: 0.3,
    metalness: 0.15
  });
  const centrioleGroup = new THREE.Group();
  centrioleGroup.position.set(-0.25, 0.2, 0.75);

  const cenCylGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.45, 12);

  const cen1 = new THREE.Mesh(cenCylGeo, centrioleMat);
  cen1.position.set(-0.16, 0.08, 0);
  cen1.rotation.z = Math.PI / 4;
  centrioleGroup.add(cen1);

  const cen2 = new THREE.Mesh(cenCylGeo, centrioleMat);
  cen2.position.set(0.16, 0.08, 0);
  cen2.rotation.x = Math.PI / 3;
  centrioleGroup.add(cen2);

  cellGroup.add(centrioleGroup);

  // -------------------------------------------------------------
  // 8. LYSOSOMES & PEROXISOMES (Thể tiêu bào & peroxisome)
  // -------------------------------------------------------------
  const lysoMat = new THREE.MeshStandardMaterial({
    color: 0xfde047, // Bright yellow
    roughness: 0.35
  });
  const lysoGeo = new THREE.DodecahedronGeometry(0.18);

  const lyso1 = new THREE.Mesh(lysoGeo, lysoMat);
  lyso1.position.set(-1.8, 0.18, 0.95);
  cellGroup.add(lyso1);

  const lyso2 = new THREE.Mesh(lysoGeo, lysoMat);
  lyso2.position.set(2.4, 0.18, -0.5);
  cellGroup.add(lyso2);

  // -------------------------------------------------------------
  // 9. NUMBERED 3D BADGES (1 to 6) STRICTLY MATCHING SKETCHFAB MODEL
  // -------------------------------------------------------------
  // Badge specifications:
  // 1: Dịch nhân (Nucleoplasm)
  // 2: Nhân con (Nucleolus)
  // 3: Lưới nội chất hạt (Rough ER)
  // 4: Bộ máy Golgi (Golgi apparatus)
  // 5: Ty thể (Mitochondrion)
  // 6: Lưới nội chất trơn (Smooth ER)
  function createNumberedBadge(num: number): THREE.Group {
    const badge = new THREE.Group();

    // Dark purple circular disc with translucent frosted rim
    const discGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.04, 24);
    const discMat = new THREE.MeshBasicMaterial({ color: 0x1e1b4b }); // Dark indigo
    const discMesh = new THREE.Mesh(discGeo, discMat);
    badge.add(discMesh);

    // Glowing border ring
    const ringGeo = new THREE.TorusGeometry(0.16, 0.02, 6, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xc084fc }); // Violet glow
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    badge.add(ringMesh);

    // Canvas texture with bold white number
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 84px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${num}`, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const labelGeo = new THREE.PlaneGeometry(0.24, 0.24);
    const labelMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.rotation.x = -Math.PI / 2;
    labelMesh.position.y = 0.025;
    badge.add(labelMesh);

    return badge;
  }

  const badgeLocations = [
    { num: 1, pos: new THREE.Vector3(-0.35, 0.48, -0.65) }, // Nucleoplasm
    { num: 2, pos: new THREE.Vector3(0.08, 0.58, -0.75) },  // Nucleolus
    { num: 3, pos: new THREE.Vector3(0.0, 0.38, 0.05) },    // Rough ER
    { num: 4, pos: new THREE.Vector3(1.75, 0.42, 0.45) },   // Golgi
    { num: 5, pos: new THREE.Vector3(0.25, 0.36, 1.25) },   // Mitochondria
    { num: 6, pos: new THREE.Vector3(-1.45, 0.42, 0.45) }   // Smooth ER
  ];

  badgeLocations.forEach(b => {
    const badgeMesh = createNumberedBadge(b.num);
    badgeMesh.position.copy(b.pos);
    cellGroup.add(badgeMesh);
  });

  // Tilted orientation so the top face is inclined towards the viewer
  cellGroup.rotation.set(0.35, -0.12, 0.08);

  return cellGroup;
}
