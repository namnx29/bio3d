import * as THREE from 'three';

/**
 * Builds a high-fidelity, scientifically accurate 3D model of a Plant Cell (Tế bào thực vật)
 * strictly matching modern biological 3D representations & educational standards (Sinh học 10):
 * - Rigid prismatic/polygonal cellulose cell wall with layered cutaway (Middle lamella -> Primary wall -> Secondary wall)
 * - Fine plasmodesmata channels piercing through the thick wall
 * - Delicate inner plasma membrane (màng sinh chất)
 * - Huge translucent central vacuole (Không bào trung tâm) bounded by tonoplast, occupying 60% of cell volume
 * - Large laterally displaced Nucleus (Nhân bị đẩy sát màng) with cutaway nucleoplasm & dense nucleolus
 * - Concentric Rough Endoplasmic Reticulum (RER) studded with ribosomes & branching Smooth ER (SER)
 * - Multiple prominent Chloroplasts (Lục lạp) with internal cutaways showing Grana thylakoid stacks & lamellae
 * - Cutaway Mitochondria (Ty thể) with folded orange cristae
 * - Curved Golgi apparatus (Dictyosome) with secretory vesicles
 * - Peroxisomes & Amyloplasts (hạt tinh bột)
 * - Numbered educational 3D badges (1 to 7) matching the educational interactive curriculum
 */

export function buildRealisticPlantCellModel(): THREE.Group {
  const cellGroup = new THREE.Group();
  cellGroup.name = 'realistic_plant_cell_group';

  // -------------------------------------------------------------
  // 1. CELL WALL (Thành tế bào Xenlulôzơ) & CYTOPLASM BASE
  // -------------------------------------------------------------
  // Polygonal rounded prism representing rigid plant cell morphology
  // Dimensions: X width ~ 6.2, Z depth ~ 4.8, Y height ~ 2.0
  const wallCornerRadius = 0.6;
  const halfW = 3.0;
  const halfD = 2.3;
  const wallHeight = 1.9;

  // Outer cell wall path (rounded rectangle / chamfered polygon)
  const outerShape = new THREE.Shape();
  outerShape.moveTo(-halfW + wallCornerRadius, -halfD);
  outerShape.lineTo(halfW - wallCornerRadius, -halfD);
  outerShape.quadraticCurveTo(halfW, -halfD, halfW, -halfD + wallCornerRadius);
  outerShape.lineTo(halfW, halfD - wallCornerRadius);
  outerShape.quadraticCurveTo(halfW, halfD, halfW - wallCornerRadius, halfD);
  outerShape.lineTo(-halfW + wallCornerRadius, halfD);
  outerShape.quadraticCurveTo(-halfW, halfD, -halfW, halfD - wallCornerRadius);
  outerShape.lineTo(-halfW, -halfD + wallCornerRadius);
  outerShape.quadraticCurveTo(-halfW, -halfD, -halfW + wallCornerRadius, -halfD);

  // Outer wall material: Vibrant Jade/Forest Green with satin finish
  const outerWallMat = new THREE.MeshStandardMaterial({
    color: 0x15803d, // Deep vibrant plant green
    roughness: 0.38,
    metalness: 0.08
  });

  // Layered cut rim material: Pale lime-yellow / cream showing cellulose cross-section
  const cutRimMat = new THREE.MeshStandardMaterial({
    color: 0xbef264, // Bright chartreuse / lime cream cut surface
    roughness: 0.3,
    metalness: 0.05
  });

  // Inner wall lining: Emerald green
  const innerWallMat = new THREE.MeshStandardMaterial({
    color: 0x166534,
    roughness: 0.42
  });

  // Bottom base plate
  const baseExtrude = new THREE.ExtrudeGeometry(outerShape, {
    depth: 0.35,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.12,
    bevelThickness: 0.12
  });
  const baseMesh = new THREE.Mesh(baseExtrude, outerWallMat);
  baseMesh.rotation.x = Math.PI / 2;
  baseMesh.position.y = -0.15;
  baseMesh.receiveShadow = true;
  cellGroup.add(baseMesh);

  // Outer wall perimeter border (thick rigid barrier)
  // We build perimeter walls with a 3/4 cutaway style (back and sides closed, front-right open for clear inspection)
  const wallPoints = outerShape.getPoints(48);
  const wallThick = 0.28;

  // 3-Sided Cutaway Wall (Back, Left, and partial Right side)
  // Let's create an extruded hollow perimeter
  const innerShape = new THREE.Shape();
  const innerW = halfW - wallThick;
  const innerD = halfD - wallThick;
  innerShape.moveTo(-innerW + wallCornerRadius * 0.8, -innerD);
  innerShape.lineTo(innerW - wallCornerRadius * 0.8, -innerD);
  innerShape.quadraticCurveTo(innerW, -innerD, innerW, -innerD + wallCornerRadius * 0.8);
  innerShape.lineTo(innerW, innerD - wallCornerRadius * 0.8);
  innerShape.quadraticCurveTo(innerW, innerD, innerW - wallCornerRadius * 0.8, innerD);
  innerShape.lineTo(-innerW + wallCornerRadius * 0.8, innerD);
  innerShape.quadraticCurveTo(-innerW, innerD, -innerW, innerD - wallCornerRadius * 0.8);
  innerShape.lineTo(-innerW, -innerD + wallCornerRadius * 0.8);
  innerShape.quadraticCurveTo(-innerW, -innerD, -innerW + wallCornerRadius * 0.8, -innerD);

  // Back Wall & Left Wall (Cutaway enclosure)
  // Tube along perimeter curve for smooth rounded cellulose rim
  const rimCurvePoints: THREE.Vector3[] = [];
  wallPoints.forEach(p => {
    rimCurvePoints.push(new THREE.Vector3(p.x, 0.95, p.y));
  });
  const rimCurve = new THREE.CatmullRomCurve3(rimCurvePoints, true);
  const rimTube = new THREE.Mesh(
    new THREE.TubeGeometry(rimCurve, 64, 0.18, 10, true),
    cutRimMat
  );
  rimTube.castShadow = true;
  cellGroup.add(rimTube);

  // Lower wall skirt
  const skirtTube = new THREE.Mesh(
    new THREE.TubeGeometry(rimCurve, 64, 0.22, 10, true),
    outerWallMat
  );
  skirtTube.position.y = -0.55;
  cellGroup.add(skirtTube);

  // Middle Lamella stripe (Phiến giữa - pectin thin decorative band)
  const lamellaMat = new THREE.MeshStandardMaterial({
    color: 0x65a30d, // Olive-lime pectin middle lamella
    roughness: 0.35
  });
  const lamellaTube = new THREE.Mesh(
    new THREE.TubeGeometry(rimCurve, 64, 0.06, 8, true),
    lamellaMat
  );
  lamellaTube.position.y = -0.15;
  cellGroup.add(lamellaTube);

  // Cytoplasm Bed (Tế bào chất nền - màu xanh ngọc nhạt mát mắt)
  const cytoFloorGeo = new THREE.ShapeGeometry(innerShape);
  const cytoFloorMat = new THREE.MeshStandardMaterial({
    color: 0xa7f3d0, // Pale fresh mint-emerald cytoplasm
    roughness: 0.45,
    metalness: 0.04
  });
  const cytoFloor = new THREE.Mesh(cytoFloorGeo, cytoFloorMat);
  cytoFloor.rotation.x = Math.PI / 2;
  cytoFloor.position.y = 0.05;
  cytoFloor.receiveShadow = true;
  cellGroup.add(cytoFloor);

  // Delicate Plasma Membrane (Màng sinh chất vàng chanh óng ánh viền trong)
  const plasmaMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15, // Golden yellow-green plasma membrane
    roughness: 0.25,
    metalness: 0.15
  });
  const innerPoints = innerShape.getPoints(48);
  const innerCurvePoints: THREE.Vector3[] = [];
  innerPoints.forEach(p => {
    innerCurvePoints.push(new THREE.Vector3(p.x, 0.9, p.y));
  });
  const innerCurve = new THREE.CatmullRomCurve3(innerCurvePoints, true);
  const plasmaBorder = new THREE.Mesh(
    new THREE.TubeGeometry(innerCurve, 64, 0.05, 8, true),
    plasmaMat
  );
  cellGroup.add(plasmaBorder);

  // Plasmodesmata (Cầu sinh chất - Kênh liên bào xuyên thành)
  const plasmoMat = new THREE.MeshStandardMaterial({
    color: 0xf97316, // Orange-amber channels
    roughness: 0.3
  });
  const plasmoGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.45, 8);
  // Place 14 plasmodesmata pores piercing through the wall perimeter
  for (let pl = 0; pl < 14; pl++) {
    const frac = pl / 14;
    const pt = rimCurve.getPoint(frac);
    const plasmo = new THREE.Mesh(plasmoGeo, plasmoMat);
    plasmo.position.set(pt.x, 0.35 + Math.sin(pl) * 0.2, pt.z);
    plasmo.rotation.z = Math.PI / 2;
    plasmo.rotation.y = frac * Math.PI * 2;
    cellGroup.add(plasmo);
  }

  // -------------------------------------------------------------
  // 2. LARGE CENTRAL VACUOLE (Không bào trung tâm khổng lồ - Số 2)
  // -------------------------------------------------------------
  // Occupies ~60% of cell space, organic pillow/rounded bulb shape
  // Beautiful aqua-cyan transparent glass material with tonoplast membrane
  const vacuoleGroup = new THREE.Group();
  vacuoleGroup.position.set(0.65, 0.55, -0.15);

  const vacuoleGeo = new THREE.SphereGeometry(1.65, 32, 24);
  // Organic deformation: flatten in Y, stretch in X and Z
  vacuoleGeo.scale(1.35, 0.72, 1.15);

  const vacuoleMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8, // Sky / cyan blue cell sap
    roughness: 0.08,
    transmission: 0.78, // High glass transmission
    thickness: 1.2,
    opacity: 0.85,
    transparent: true,
    ior: 1.33
  });
  const vacuoleMesh = new THREE.Mesh(vacuoleGeo, vacuoleMat);
  vacuoleMesh.castShadow = true;
  vacuoleGroup.add(vacuoleMesh);

  // Tonoplast membrane outer glow / delicate edge (Màng không bào)
  const tonoplastMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    roughness: 0.15,
    wireframe: false,
    transparent: true,
    opacity: 0.45
  });
  const tonoGeo = new THREE.SphereGeometry(1.68, 24, 18);
  tonoGeo.scale(1.36, 0.73, 1.16);
  const tonoMesh = new THREE.Mesh(tonoGeo, tonoplastMat);
  vacuoleGroup.add(tonoMesh);

  // Internal crystal/pigment granules inside vacuole (các thể vùi/tinh thể canxi oxalat)
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0xe0f2fe,
    metalness: 0.6,
    roughness: 0.1
  });
  const crystalGeo = new THREE.OctahedronGeometry(0.12);
  for (let cr = 0; cr < 6; cr++) {
    const cMesh = new THREE.Mesh(crystalGeo, crystalMat);
    cMesh.position.set(
      (Math.random() - 0.5) * 1.5,
      (Math.random() - 0.5) * 0.4,
      (Math.random() - 0.5) * 1.2
    );
    vacuoleGroup.add(cMesh);
  }

  cellGroup.add(vacuoleGroup);

  // -------------------------------------------------------------
  // 3. NUCLEUS (Nhân tế bào bị đẩy lệch một bên - Số 4)
  // -------------------------------------------------------------
  // Positioned laterally in the left-front quadrant: [-1.85, 0.55, 0.85]
  const nucleusGroup = new THREE.Group();
  const nucPos = new THREE.Vector3(-1.75, 0.52, 0.8);
  nucleusGroup.position.copy(nucPos);

  const nucRadius = 0.85;

  // A. Royal Purple Nuclear Envelope with cutaway
  const nucEnvMat = new THREE.MeshStandardMaterial({
    color: 0x7e22ce, // Deep royal purple
    roughness: 0.32,
    metalness: 0.1
  });
  // 3/4 cut sphere for nuclear envelope
  const nucEnvGeo = new THREE.SphereGeometry(
    nucRadius,
    28,
    20,
    0,
    Math.PI * 1.5, // 3/4 arc
    0,
    Math.PI
  );
  const nucEnvMesh = new THREE.Mesh(nucEnvGeo, nucEnvMat);
  nucEnvMesh.rotation.y = -Math.PI * 0.25;
  nucEnvMesh.castShadow = true;
  nucleusGroup.add(nucEnvMesh);

  // B. Cutaway Face: Nucleoplasm (Dịch nhân - Hồng lavender sáng)
  const nucleoplasmMat = new THREE.MeshStandardMaterial({
    color: 0xf472b6, // Lavender-pink nucleoplasm
    roughness: 0.28,
    metalness: 0.05
  });
  const cutFace1 = new THREE.Mesh(
    new THREE.CircleGeometry(nucRadius, 24),
    nucleoplasmMat
  );
  cutFace1.rotation.y = Math.PI / 2 - Math.PI * 0.25;
  nucleusGroup.add(cutFace1);

  const cutFace2 = new THREE.Mesh(
    new THREE.CircleGeometry(nucRadius, 24),
    nucleoplasmMat
  );
  cutFace2.rotation.y = Math.PI - Math.PI * 0.25;
  nucleusGroup.add(cutFace2);

  // C. Nucleolus (Nhân con / Hạch nhân - Thể tròn xanh lam đậm ở trung tâm)
  const nucleolusMat = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8, // Royal cobalt blue
    roughness: 0.45,
    metalness: 0.12
  });
  const nucConMesh = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 16), nucleolusMat);
  nucConMesh.position.set(0.05, 0.02, 0.05);
  nucleusGroup.add(nucConMesh);

  // D. Tiny Nuclear Pores (Lỗ màng nhân) in yellow
  const poreMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  const poreGeo = new THREE.SphereGeometry(0.035, 6, 6);
  for (let p = 0; p < 12; p++) {
    const theta = (p / 12) * Math.PI * 1.4;
    const phi = Math.PI * 0.3 + (p % 3) * 0.2;
    const pore = new THREE.Mesh(poreGeo, poreMat);
    pore.position.set(
      Math.sin(phi) * Math.cos(theta) * (nucRadius + 0.01),
      Math.cos(phi) * (nucRadius + 0.01),
      Math.sin(phi) * Math.sin(theta) * (nucRadius + 0.01)
    );
    nucleusGroup.add(pore);
  }

  cellGroup.add(nucleusGroup);

  // -------------------------------------------------------------
  // 4. ENDOPLASMIC RETICULUM (Lưới nội chất hạt RER & trơn SER - Số 5)
  // -------------------------------------------------------------
  // A. Rough ER: Concentric indigo folds wrapping the nucleus with pink ribosomes
  const roughErMat = new THREE.MeshStandardMaterial({
    color: 0x312e81, // Deep indigo
    roughness: 0.35,
    metalness: 0.12
  });
  const riboMat = new THREE.MeshStandardMaterial({
    color: 0xf43f5e, // Coral pink ribosomes
    roughness: 0.2
  });
  const riboGeo = new THREE.SphereGeometry(0.038, 6, 6);

  const erRadii = [1.1, 1.4, 1.7];
  erRadii.forEach((r, idx) => {
    const pts: THREE.Vector3[] = [];
    const steps = 24;
    for (let s = 0; s <= steps; s++) {
      const frac = s / steps;
      const angle = -Math.PI * 0.35 + frac * Math.PI * 0.85;
      const wave = Math.sin(frac * Math.PI * 5 + idx) * 0.1;
      const curR = r + wave;
      const ex = nucPos.x + Math.cos(angle) * curR;
      const ez = nucPos.z + Math.sin(angle) * curR;
      const ey = nucPos.y + 0.08 + Math.sin(frac * Math.PI * 3) * 0.06;
      pts.push(new THREE.Vector3(ex, ey, ez));
    }
    const erCurve = new THREE.CatmullRomCurve3(pts);
    const erTube = new THREE.Mesh(
      new THREE.TubeGeometry(erCurve, 28, 0.075, 8, false),
      roughErMat
    );
    erTube.castShadow = true;
    cellGroup.add(erTube);

    // Ribosome granules on ER fold
    for (let rb = 0; rb < 14; rb++) {
      const tVal = (rb + 0.5) / 14;
      const pt = erCurve.getPoint(tVal);
      const rDot = new THREE.Mesh(riboGeo, riboMat);
      rDot.position.copy(pt).add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.09,
        0.06,
        (Math.random() - 0.5) * 0.09
      ));
      cellGroup.add(rDot);
    }
  });

  // B. Smooth ER: Branching tubular pipes (màu tím violet)
  const smoothErMat = new THREE.MeshStandardMaterial({
    color: 0x9333ea,
    roughness: 0.3,
    metalness: 0.1
  });
  const serCurves = [
    [new THREE.Vector3(-2.2, 0.3, 0.1), new THREE.Vector3(-2.4, 0.45, -0.3), new THREE.Vector3(-2.1, 0.35, -0.6)],
    [new THREE.Vector3(-2.4, 0.45, -0.3), new THREE.Vector3(-2.6, 0.5, -0.1), new THREE.Vector3(-2.5, 0.35, 0.3)]
  ];
  serCurves.forEach(pts => {
    const c = new THREE.CatmullRomCurve3(pts);
    const t = new THREE.Mesh(new THREE.TubeGeometry(c, 16, 0.07, 8, false), smoothErMat);
    cellGroup.add(t);
  });

  // -------------------------------------------------------------
  // 5. CHLOROPLASTS (Lục lạp - Bào quan quang hợp - Số 3)
  // -------------------------------------------------------------
  // 5 vivid chloroplasts in the peripheral cytoplasm
  // Some with cutaway showing internal Grana stacks (cột đĩa thylakoid)
  function createChloroplast(hasCutaway = false): THREE.Group {
    const chloro = new THREE.Group();

    const outerMat = new THREE.MeshStandardMaterial({
      color: 0x16a34a, // Vibrant chlorophyll green
      roughness: 0.3,
      metalness: 0.08
    });
    const cutRimGreenMat = new THREE.MeshStandardMaterial({
      color: 0xbef264, // Bright lime-chartreuse cut rim
      roughness: 0.25
    });
    const stromaMat = new THREE.MeshStandardMaterial({
      color: 0x65a30d, // Dark olive/amber-green stroma matrix
      roughness: 0.4
    });
    const granaDiscMat = new THREE.MeshStandardMaterial({
      color: 0x4ade80, // Fresh lime green thylakoid discs
      roughness: 0.28,
      metalness: 0.05
    });

    if (!hasCutaway) {
      // Whole oval biconvex lens
      const lensGeo = new THREE.SphereGeometry(0.38, 20, 16);
      lensGeo.scale(1.35, 0.55, 0.85);
      const lens = new THREE.Mesh(lensGeo, outerMat);
      lens.castShadow = true;
      chloro.add(lens);
    } else {
      // 3/4 cutaway biconvex lens
      const cutLensGeo = new THREE.SphereGeometry(
        0.42,
        24,
        16,
        0,
        Math.PI * 1.5,
        0,
        Math.PI
      );
      cutLensGeo.scale(1.4, 0.58, 0.9);
      const cutLens = new THREE.Mesh(cutLensGeo, outerMat);
      cutLens.castShadow = true;
      chloro.add(cutLens);

      // Flat cut stroma floor
      const stromaFace = new THREE.Mesh(
        new THREE.PlaneGeometry(0.55, 0.45),
        stromaMat
      );
      stromaFace.rotation.x = -Math.PI / 2;
      stromaFace.position.y = 0.02;
      chloro.add(stromaFace);

      // Cut rim edge highlight
      const rimTorus = new THREE.Mesh(
        new THREE.TorusGeometry(0.38, 0.035, 6, 20, Math.PI * 1.5),
        cutRimGreenMat
      );
      rimTorus.rotation.x = Math.PI / 2;
      chloro.add(rimTorus);

      // 3 Grana stacks (Pillars of stacked round thylakoid discs)
      const granaCenters = [
        new THREE.Vector3(-0.18, 0.05, 0.05),
        new THREE.Vector3(0.08, 0.05, -0.08),
        new THREE.Vector3(0.18, 0.05, 0.12)
      ];
      const discGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.024, 12);

      granaCenters.forEach(gc => {
        const stackHeight = 4;
        for (let d = 0; d < stackHeight; d++) {
          const disc = new THREE.Mesh(discGeo, granaDiscMat);
          disc.position.set(gc.x, gc.y + d * 0.035, gc.z);
          disc.castShadow = true;
          chloro.add(disc);
        }
      });

      // Stromal lamellae (cầu nối liên grana)
      const bridgeMat = new THREE.MeshBasicMaterial({ color: 0x86efac });
      const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.015, 0.03), bridgeMat);
      bridge.position.set(-0.02, 0.12, 0.02);
      bridge.rotation.y = 0.35;
      chloro.add(bridge);
    }

    return chloro;
  }

  // Position 5 Chloroplasts around the cell periphery
  const chloroConfigs = [
    { pos: new THREE.Vector3(-2.1, 0.42, -1.4), rot: [0.1, 0.4, 0.2], cut: true },
    { pos: new THREE.Vector3(-0.6, 0.45, -1.8), rot: [-0.15, -0.3, 0.1], cut: true },
    { pos: new THREE.Vector3(1.8, 0.42, -1.6), rot: [0.2, 0.6, -0.1], cut: false },
    { pos: new THREE.Vector3(2.3, 0.42, 0.8), rot: [-0.2, -0.5, 0.2], cut: true },
    { pos: new THREE.Vector3(-0.8, 0.4, 1.6), rot: [0.1, -0.2, -0.15], cut: false }
  ];

  chloroConfigs.forEach(cfg => {
    const cp = createChloroplast(cfg.cut);
    cp.position.copy(cfg.pos);
    cp.rotation.set(cfg.rot[0], cfg.rot[1], cfg.rot[2]);
    cellGroup.add(cp);
  });

  // -------------------------------------------------------------
  // 6. MITOCHONDRIA (Ty thể - Bào quan hô hấp - Số 6)
  // -------------------------------------------------------------
  // Sausage-shaped organelles with cutaway revealing orange cristae
  function createMitochondrion(): THREE.Group {
    const mito = new THREE.Group();

    const outerMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b, // Crimson red-brown outer membrane
      roughness: 0.32,
      metalness: 0.1
    });
    const cristaeMat = new THREE.MeshStandardMaterial({
      color: 0xf97316, // Bright vibrant orange cristae folds
      roughness: 0.35
    });

    // Outer capsule body
    const capsuleGeo = new THREE.CapsuleGeometry(0.18, 0.42, 10, 16);
    const capMesh = new THREE.Mesh(capsuleGeo, outerMat);
    capMesh.rotation.z = Math.PI / 2;
    capMesh.castShadow = true;
    mito.add(capMesh);

    // Cutaway top slice with zigzag orange cristae
    const cristaeFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(0.65, 0.28),
      cristaeMat
    );
    cristaeFloor.rotation.x = -Math.PI / 2;
    cristaeFloor.position.y = 0.12;
    mito.add(cristaeFloor);

    // Zigzag cristae folds
    const foldMat = new THREE.MeshStandardMaterial({ color: 0xfdc300 });
    const foldGeo = new THREE.BoxGeometry(0.04, 0.08, 0.22);
    for (let f = 0; f < 5; f++) {
      const fold = new THREE.Mesh(foldGeo, foldMat);
      fold.position.set(-0.2 + f * 0.1, 0.15, 0);
      fold.rotation.y = (f % 2 === 0 ? 0.3 : -0.3);
      mito.add(fold);
    }

    return mito;
  }

  const mitoPositions = [
    { pos: new THREE.Vector3(-1.6, 0.35, -0.6), rot: 0.5 },
    { pos: new THREE.Vector3(0.2, 0.35, 1.6), rot: -0.35 },
    { pos: new THREE.Vector3(2.2, 0.38, -0.5), rot: 0.8 }
  ];

  mitoPositions.forEach(mp => {
    const m = createMitochondrion();
    m.position.copy(mp.pos);
    m.rotation.y = mp.rot;
    cellGroup.add(m);
  });

  // -------------------------------------------------------------
  // 7. GOLGI APPARATUS (Dictyosome - Số 7)
  // -------------------------------------------------------------
  // Stack of 4 curved amber/coral cisternae with budding secretory vesicles
  const golgiGroup = new THREE.Group();
  golgiGroup.position.set(1.4, 0.35, 1.45);
  golgiGroup.rotation.y = -0.4;

  const golgiMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b, // Warm amber / orange
    roughness: 0.28,
    metalness: 0.1
  });
  const vesicMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    roughness: 0.25
  });

  for (let g = 0; g < 4; g++) {
    const pts: THREE.Vector3[] = [];
    const spreadZ = (g - 1.5) * 0.14;
    const rad = 0.55 - Math.abs(g - 1.5) * 0.05;

    for (let s = 0; s <= 12; s++) {
      const frac = s / 12;
      const angle = -Math.PI * 0.4 + frac * Math.PI * 0.8;
      const gx = Math.sin(angle) * (rad * 0.5);
      const gz = spreadZ + Math.cos(angle) * rad;
      const gy = 0.05 + Math.sin(frac * Math.PI) * 0.06;
      pts.push(new THREE.Vector3(gx, gy, gz));
    }
    const gCurve = new THREE.CatmullRomCurve3(pts);
    const gTube = new THREE.Mesh(
      new THREE.TubeGeometry(gCurve, 18, 0.055, 8, false),
      golgiMat
    );
    gTube.castShadow = true;
    golgiGroup.add(gTube);

    // Swollen bulbous tips
    const bulbGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const bStart = new THREE.Mesh(bulbGeo, golgiMat);
    bStart.position.copy(pts[0]);
    golgiGroup.add(bStart);
    const bEnd = new THREE.Mesh(bulbGeo, golgiMat);
    bEnd.position.copy(pts[pts.length - 1]);
    golgiGroup.add(bEnd);
  }

  // Budding transport vesicles around Golgi
  const vesicGeo = new THREE.SphereGeometry(0.065, 8, 8);
  for (let v = 0; v < 6; v++) {
    const vm = new THREE.Mesh(vesicGeo, vesicMat);
    vm.position.set(
      (Math.random() - 0.5) * 0.8,
      0.1 + Math.random() * 0.2,
      (Math.random() - 0.5) * 0.6
    );
    golgiGroup.add(vm);
  }
  cellGroup.add(golgiGroup);

  // -------------------------------------------------------------
  // 8. PEROXISOMES & AMYLOPLASTS (Thể vi thể & Hạt tinh bột)
  // -------------------------------------------------------------
  // Small single-membrane organelles with crystalline catalase cores
  const peroxMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.3
  });
  const amylMat = new THREE.MeshStandardMaterial({
    color: 0xfef9c3, // Creamy starch grains
    roughness: 0.6
  });

  const peroxGeo = new THREE.SphereGeometry(0.14, 12, 12);
  const p1 = new THREE.Mesh(peroxGeo, peroxMat);
  p1.position.set(-1.1, 0.28, -1.1);
  cellGroup.add(p1);

  const p2 = new THREE.Mesh(peroxGeo, peroxMat);
  p2.position.set(1.9, 0.3, 0.2);
  cellGroup.add(p2);

  // Amyloplasts (Hạt tinh bột)
  const amy1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.15), amylMat);
  amy1.position.set(-0.2, 0.24, -1.2);
  cellGroup.add(amy1);

  // -------------------------------------------------------------
  // 9. NUMBERED 3D EDUCATIONAL BADGES (1 to 7)
  // -------------------------------------------------------------
  // 1: Thành tế bào Xenlulôzơ & Cầu sinh chất (Cell Wall & Plasmodesmata)
  // 2: Không bào trung tâm & Màng tonoplast (Large Central Vacuole)
  // 3: Lục lạp (Chloroplasts với hạt Grana quang hợp)
  // 4: Nhân tế bào & Hạch nhân (Nucleus & Nucleolus)
  // 5: Lưới nội chất RER & SER (Endoplasmic Reticulum)
  // 6: Ty thể (Mitochondria)
  // 7: Bộ máy Golgi (Dictyosome)
  function createPlantBadge(num: number): THREE.Group {
    const badge = new THREE.Group();

    // Dark forest green circular disc
    const discGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.04, 24);
    const discMat = new THREE.MeshBasicMaterial({ color: 0x064e3b }); // Deep emerald
    const discMesh = new THREE.Mesh(discGeo, discMat);
    badge.add(discMesh);

    // Glowing border ring
    const ringGeo = new THREE.TorusGeometry(0.16, 0.02, 6, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x34d399 }); // Emerald glow
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

  const badgePositions = [
    { num: 1, pos: new THREE.Vector3(-2.85, 1.05, 0.0) },   // 1: Thành tế bào & Cầu sinh chất
    { num: 2, pos: new THREE.Vector3(0.65, 1.25, -0.15) },  // 2: Không bào trung tâm
    { num: 3, pos: new THREE.Vector3(-2.1, 0.85, -1.4) },   // 3: Lục lạp
    { num: 4, pos: new THREE.Vector3(-1.75, 1.25, 0.8) },   // 4: Nhân & Nhân con
    { num: 5, pos: new THREE.Vector3(-1.45, 0.72, 1.85) },  // 5: Lưới nội chất
    { num: 6, pos: new THREE.Vector3(0.2, 0.65, 1.6) },     // 6: Ty thể
    { num: 7, pos: new THREE.Vector3(1.4, 0.72, 1.45) }     // 7: Bộ máy Golgi
  ];

  badgePositions.forEach(b => {
    const badge = createPlantBadge(b.num);
    badge.position.copy(b.pos);
    cellGroup.add(badge);
  });

  return cellGroup;
}
