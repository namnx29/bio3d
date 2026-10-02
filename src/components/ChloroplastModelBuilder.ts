import * as THREE from 'three';

/**
 * Builds a high-fidelity 3D model of a Chloroplast (Lục lạp)
 * strictly matching the user's reference image:
 * - Oval cutaway biconvex lens shape tilted at an oblique angle
 * - Dual membrane shell: glossy dark forest green outer membrane,
 *   crisp double-contour bright chartreuse/lime cutaway rim,
 *   and warm yellow-green stroma cavity lining
 * - Distinct Grana stacks (7-9 cylindrical columns of thylakoid discs)
 *   with rounded edges and rich chlorophyll green specular sheen
 * - Intergranal thylakoids (stromal lamellae / cầu nối thylakoid) bridging between stacks
 * - Circular chloroplast DNA rings and 70S ribosomes in the stroma
 */

export function buildRealisticChloroplastModel(): THREE.Group {
  const chloroGroup = new THREE.Group();
  chloroGroup.name = 'realistic_chloroplast_group';

  // Overall scale factors for ellipsoidal lens
  const radiusX = 3.2; // Long axis
  const radiusY = 1.7; // Height/Thickness
  const radiusZ = 2.3; // Width/Depth

  // -------------------------------------------------------------
  // 1. DUAL MEMBRANE ENVELOPE (Hệ thống màng kép)
  // -------------------------------------------------------------

  // Materials
  const outerMemMat = new THREE.MeshStandardMaterial({
    color: 0x1b4320, // Dark glossy forest green (matching outer shell in image)
    roughness: 0.25,
    metalness: 0.12,
    side: THREE.DoubleSide
  });

  const innerStromaMat = new THREE.MeshStandardMaterial({
    color: 0x84cc16, // Warm lime/yellow-green stroma cavity
    roughness: 0.42,
    metalness: 0.05,
    side: THREE.DoubleSide
  });

  const rimBrightMat = new THREE.MeshStandardMaterial({
    color: 0xccff33, // Vivid chartreuse/lime inner cut rim (matching image)
    roughness: 0.2,
    metalness: 0.15
  });

  const rimOuterMat = new THREE.MeshStandardMaterial({
    color: 0x4ade80, // Medium green outer rim contour
    roughness: 0.3,
    metalness: 0.1
  });

  // A. Outer Shell: Hemispherical lower bowl of an ellipsoid
  // Sphere from phi = PI * 0.45 to PI (bottom bowl)
  const outerGeo = new THREE.SphereGeometry(1.0, 40, 24, 0, Math.PI * 2, Math.PI * 0.48, Math.PI * 0.52);
  const outerMesh = new THREE.Mesh(outerGeo, outerMemMat);
  outerMesh.scale.set(radiusX, radiusY, radiusZ);
  outerMesh.castShadow = true;
  outerMesh.receiveShadow = true;
  chloroGroup.add(outerMesh);

  // B. Inner Cavity Lining (Stroma Bowl): slightly recessed
  const innerGeo = new THREE.SphereGeometry(1.0, 36, 20, 0, Math.PI * 2, Math.PI * 0.48, Math.PI * 0.52);
  const innerMesh = new THREE.Mesh(innerGeo, innerStromaMat);
  innerMesh.scale.set(radiusX * 0.94, radiusY * 0.92, radiusZ * 0.94);
  innerMesh.position.y = -0.02;
  chloroGroup.add(innerMesh);

  // C. The Iconic Double-Layered Cut Rim (Mép cắt màng kép hình bầu dục)
  // We construct smooth elliptical tubes following the cut boundary
  const rimPointsInner: THREE.Vector3[] = [];
  const rimPointsOuter: THREE.Vector3[] = [];
  const rimSegments = 64;

  for (let i = 0; i <= rimSegments; i++) {
    const angle = (i / rimSegments) * Math.PI * 2;
    // Base ellipse in XZ
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    // Inner bright lime rim
    const rxIn = (radiusX * 0.95) * cosA;
    const rzIn = (radiusZ * 0.95) * sinA;
    const ryIn = Math.sin(angle * 2) * 0.04;
    rimPointsInner.push(new THREE.Vector3(rxIn, ryIn, rzIn));

    // Outer green border rim
    const rxOut = (radiusX * 0.99) * cosA;
    const rzOut = (radiusZ * 0.99) * sinA;
    const ryOut = ryIn - 0.03;
    rimPointsOuter.push(new THREE.Vector3(rxOut, ryOut, rzOut));
  }

  const rimCurveInner = new THREE.CatmullRomCurve3(rimPointsInner, true);
  const rimGeoInner = new THREE.TubeGeometry(rimCurveInner, 64, 0.11, 10, true);
  const rimMeshInner = new THREE.Mesh(rimGeoInner, rimBrightMat);
  chloroGroup.add(rimMeshInner);

  const rimCurveOuter = new THREE.CatmullRomCurve3(rimPointsOuter, true);
  const rimGeoOuter = new THREE.TubeGeometry(rimCurveOuter, 64, 0.08, 10, true);
  const rimMeshOuter = new THREE.Mesh(rimGeoOuter, rimOuterMat);
  chloroGroup.add(rimMeshOuter);

  // D. Stroma Floor (Lòng chất nền)
  const floorGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.08, 36);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x65a30d, // Olive lime stroma floor
    roughness: 0.5,
    metalness: 0.05
  });
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.scale.set(radiusX * 0.88, 1.0, radiusZ * 0.88);
  floorMesh.position.y = -0.35;
  floorMesh.receiveShadow = true;
  chloroGroup.add(floorMesh);

  // -------------------------------------------------------------
  // 2. THYLAKOID DISCS & GRANA STACKS (Các hạt Grana)
  // -------------------------------------------------------------
  // Materials for thylakoid discs
  const thylakoidMat = new THREE.MeshStandardMaterial({
    color: 0x16a34a, // Vibrant chlorophyll grass green
    roughness: 0.28,
    metalness: 0.08
  });

  const thylakoidTopMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e, // Lighter green top face catching specular highlights
    roughness: 0.22,
    metalness: 0.1
  });

  const lamellaMat = new THREE.MeshStandardMaterial({
    color: 0x15803d, // Darker green connecting bridges
    roughness: 0.32,
    metalness: 0.05
  });

  // Granum stack definition matching the layout in image.png
  // Positions spread across the stroma cavity:
  // - Tall stacks in the deeper back region
  // - Medium stacks in the center
  // - Shorter stacks in the front near the rim
  interface GranumDef {
    id: string;
    x: number;
    z: number;
    baseY: number;
    numDiscs: number;
    discRadius: number;
  }

  const granaDefs: GranumDef[] = [
    // Back row (deepest, tallest)
    { id: 'g_back_mid', x: 0.0, z: -0.75, baseY: -0.32, numDiscs: 8, discRadius: 0.44 },
    { id: 'g_back_left', x: -0.95, z: -0.65, baseY: -0.32, numDiscs: 7, discRadius: 0.42 },
    { id: 'g_back_right', x: 0.95, z: -0.60, baseY: -0.32, numDiscs: 7, discRadius: 0.42 },

    // Middle row (central prominence)
    { id: 'g_mid_left', x: -1.70, z: -0.15, baseY: -0.32, numDiscs: 6, discRadius: 0.40 },
    { id: 'g_center', x: -0.15, z: -0.05, baseY: -0.32, numDiscs: 7, discRadius: 0.43 },
    { id: 'g_mid_right', x: 0.85, z: 0.05, baseY: -0.32, numDiscs: 6, discRadius: 0.40 },

    // Front row (shorter stacks near the open rim)
    { id: 'g_front_mid_right', x: 0.65, z: 0.70, baseY: -0.32, numDiscs: 5, discRadius: 0.38 },
    { id: 'g_front_right', x: 1.55, z: 0.45, baseY: -0.32, numDiscs: 5, discRadius: 0.36 },
    { id: 'g_front_left', x: -1.25, z: 0.50, baseY: -0.32, numDiscs: 5, discRadius: 0.37 }
  ];

  const discHeight = 0.105;
  const discGap = 0.025;
  const stepY = discHeight + discGap; // ~0.13

  // Helper to create a single rounded thylakoid disc
  function createThylakoidDisc(radius: number): THREE.Group {
    const discGroup = new THREE.Group();

    // Main cylinder
    const cylGeo = new THREE.CylinderGeometry(radius, radius, discHeight, 24);
    const cylMesh = new THREE.Mesh(cylGeo, thylakoidMat);
    cylMesh.castShadow = true;
    cylMesh.receiveShadow = true;
    discGroup.add(cylMesh);

    // Beveled rounded rim on top & bottom to match the pillowy disc appearance in image.png
    const rimGeo = new THREE.TorusGeometry(radius * 0.95, discHeight * 0.45, 6, 24);
    const topRim = new THREE.Mesh(rimGeo, thylakoidTopMat);
    topRim.rotation.x = Math.PI / 2;
    topRim.position.y = discHeight * 0.15;
    discGroup.add(topRim);

    // Top cap highlight disc
    const capGeo = new THREE.CircleGeometry(radius * 0.88, 20);
    const capMesh = new THREE.Mesh(capGeo, thylakoidTopMat);
    capMesh.rotation.x = -Math.PI / 2;
    capMesh.position.y = discHeight * 0.51;
    discGroup.add(capMesh);

    return discGroup;
  }

  // Build each granum stack
  granaDefs.forEach(def => {
    const stackGroup = new THREE.Group();
    stackGroup.name = def.id;

    for (let d = 0; d < def.numDiscs; d++) {
      const disc = createThylakoidDisc(def.discRadius);
      const dy = def.baseY + d * stepY;
      disc.position.set(0, dy, 0);
      stackGroup.add(disc);
    }

    stackGroup.position.set(def.x, 0, def.z);
    chloroGroup.add(stackGroup);
  });

  // -------------------------------------------------------------
  // 3. STROMAL LAMELLAE (Cầu nối Thylakoid giữa các hạt Grana)
  // -------------------------------------------------------------
  // In image.png, there are horizontal tubular bridges and flat strips
  // connecting the stacks together at different tier heights
  const lamellaeConnections = [
    // Between Back-Left and Back-Mid
    { fromX: -0.95, fromZ: -0.65, toX: 0.0, toZ: -0.75, tier: 3 },
    // Between Back-Mid and Back-Right
    { fromX: 0.0, fromZ: -0.75, toX: 0.95, toZ: -0.60, tier: 4 },
    // Between Mid-Left and Center
    { fromX: -1.70, fromZ: -0.15, toX: -0.15, toZ: -0.05, tier: 2 },
    // Between Center and Back-Mid
    { fromX: -0.15, fromZ: -0.05, toX: 0.0, toZ: -0.75, tier: 2 },
    // Between Center and Mid-Right
    { fromX: -0.15, fromZ: -0.05, toX: 0.85, toZ: 0.05, tier: 3 },
    // Between Mid-Right and Front-Mid-Right
    { fromX: 0.85, fromZ: 0.05, toX: 0.65, toZ: 0.70, tier: 2 },
    // Between Mid-Right and Front-Right
    { fromX: 0.85, fromZ: 0.05, toX: 1.55, toZ: 0.45, tier: 3 },
    // Between Mid-Left and Front-Left
    { fromX: -1.70, fromZ: -0.15, toX: -1.25, toZ: 0.50, tier: 1 },
    // Secondary bridge between Back-Left and Mid-Left
    { fromX: -0.95, fromZ: -0.65, toX: -1.70, toZ: -0.15, tier: 4 }
  ];

  lamellaeConnections.forEach(conn => {
    const yLevel = -0.32 + conn.tier * stepY;
    const startPt = new THREE.Vector3(conn.fromX, yLevel, conn.fromZ);
    const endPt = new THREE.Vector3(conn.toX, yLevel, conn.toZ);
    const midPt = new THREE.Vector3()
      .addVectors(startPt, endPt)
      .multiplyScalar(0.5)
      .add(new THREE.Vector3((Math.random() - 0.5) * 0.1, 0.02, (Math.random() - 0.5) * 0.1));

    const bridgeCurve = new THREE.CatmullRomCurve3([startPt, midPt, endPt]);
    // Flat tube or ribbon
    const bridgeGeo = new THREE.TubeGeometry(bridgeCurve, 16, 0.055, 8, false);
    const bridgeMesh = new THREE.Mesh(bridgeGeo, lamellaMat);
    bridgeMesh.castShadow = true;
    chloroGroup.add(bridgeMesh);
  });

  // -------------------------------------------------------------
  // 4. CHLOROPLAST DNA RINGS & RIBOSOMES 70S (ADN & Ribosome lục lạp)
  // -------------------------------------------------------------
  const cpDnaMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8, // Neon cyan circular DNA ring
    emissive: 0x0284c7,
    emissiveIntensity: 0.6,
    roughness: 0.3
  });
  const cpDnaGeo = new THREE.TorusGeometry(0.25, 0.025, 8, 24);

  const dna1 = new THREE.Mesh(cpDnaGeo, cpDnaMat);
  dna1.rotation.x = Math.PI / 2;
  dna1.position.set(-1.1, -0.31, 0.1);
  chloroGroup.add(dna1);

  const dna2 = new THREE.Mesh(cpDnaGeo, cpDnaMat);
  dna2.rotation.set(Math.PI / 2, 0.2, 0.4);
  dna2.position.set(1.1, -0.31, -0.15);
  chloroGroup.add(dna2);

  // Tiny ribosomes scattered in the stroma
  const cpRiboMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.2 });
  const cpRiboGeo = new THREE.SphereGeometry(0.04, 6, 6);
  for (let r = 0; r < 20; r++) {
    const rx = (Math.random() - 0.5) * (radiusX * 1.3);
    const rz = (Math.random() - 0.5) * (radiusZ * 1.1);
    const ribo = new THREE.Mesh(cpRiboGeo, cpRiboMat);
    ribo.position.set(rx, -0.30, rz);
    chloroGroup.add(ribo);
  }

  // -------------------------------------------------------------
  // 5. ORIENTATION & TILT MATCHING REFERENCE IMAGE
  // -------------------------------------------------------------
  // In image.png:
  // - Long axis is tilted ~ -35deg to -45deg diagonally
  // - Face is turned forward-upward so interior is fully displayed
  chloroGroup.rotation.set(0.38, 0.15, -0.48);

  return chloroGroup;
}
