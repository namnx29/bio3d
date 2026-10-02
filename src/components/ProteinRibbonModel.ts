import * as THREE from 'three';

/**
 * Builds a high-fidelity 3D Ribbon / Cartoon model of Human Serum Albumin (HSA - PDB: 1E7H)
 * matching the user's reference image:
 * - Prominent coiled red alpha-helices with rectangular ribbon cross-section (width & thickness)
 * - Thin flexible green connecting loops (random coils / turns)
 * - Pearl-white & light-gray spacefill CPK spheres for bound fatty acid ligands / prosthetic groups inside the pockets
 */

/**
 * Generates an alpha-helix ribbon with true 3D thickness, flat width, and helical pitch.
 * The ribbon's flat face points radially outward from the helix axis, giving the iconic
 * PyMOL / Mol* / Chimera cartoon representation.
 */
function createHelixRibbonGeometry(
  start: THREE.Vector3,
  end: THREE.Vector3,
  turns: number,
  radius: number = 0.40,
  width: number = 0.36,
  thickness: number = 0.08,
  initialPhase: number = 0
): { geometry: THREE.BufferGeometry; startPt: THREE.Vector3; endPt: THREE.Vector3 } {
  const dir = new THREE.Vector3().subVectors(end, start);
  const dirNorm = dir.clone().normalize();

  // Find orthonormal vectors u, v perpendicular to the helix axis
  const up = Math.abs(dirNorm.y) < 0.92 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  const u = new THREE.Vector3().crossVectors(dirNorm, up).normalize();
  const v = new THREE.Vector3().crossVectors(dirNorm, u).normalize();

  const stepsPerTurn = 22;
  const numSteps = Math.max(18, Math.round(turns * stepsPerTurn));

  const positions: number[] = [];
  const indices: number[] = [];

  let startPt = new THREE.Vector3();
  let endPt = new THREE.Vector3();

  // Generate 4 vertices for each cross section slice along the helix
  for (let i = 0; i <= numSteps; i++) {
    const s = i / numSteps;
    const theta = initialPhase + turns * 2 * Math.PI * s;
    const center = new THREE.Vector3().copy(start).addScaledVector(dir, s);

    // Radial vector (normal from helix axis outwards)
    const radial = new THREE.Vector3()
      .addScaledVector(u, Math.cos(theta))
      .addScaledVector(v, Math.sin(theta));

    // Backbone point
    const p = new THREE.Vector3().copy(center).addScaledVector(radial, radius);

    if (i === 0) startPt.copy(p);
    if (i === numSteps) endPt.copy(p);

    // Tangent derivative along curve
    const dTheta = turns * 2 * Math.PI;
    const dRadial = new THREE.Vector3()
      .addScaledVector(u, -Math.sin(theta) * dTheta)
      .addScaledVector(v, Math.cos(theta) * dTheta);
    const tangent = new THREE.Vector3().copy(dir).addScaledVector(dRadial, radius).normalize();

    // Binormal (width direction): strictly perpendicular to tangent and radial
    const binormal = new THREE.Vector3().crossVectors(tangent, radial).normalize();

    // 4 corners of ribbon rectangle cross-section:
    // width along binormal, thickness along radial
    const halfW = width * 0.5;
    const halfT = thickness * 0.5;

    // V0: top-right (+binormal, +radial)
    const v0 = new THREE.Vector3().copy(p).addScaledVector(binormal, halfW).addScaledVector(radial, halfT);
    // V1: top-left (-binormal, +radial)
    const v1 = new THREE.Vector3().copy(p).addScaledVector(binormal, -halfW).addScaledVector(radial, halfT);
    // V2: bottom-left (-binormal, -radial)
    const v2 = new THREE.Vector3().copy(p).addScaledVector(binormal, -halfW).addScaledVector(radial, -halfT);
    // V3: bottom-right (+binormal, -radial)
    const v3 = new THREE.Vector3().copy(p).addScaledVector(binormal, halfW).addScaledVector(radial, -halfT);

    positions.push(v0.x, v0.y, v0.z);
    positions.push(v1.x, v1.y, v1.z);
    positions.push(v2.x, v2.y, v2.z);
    positions.push(v3.x, v3.y, v3.z);
  }

  // Connect consecutive slices with triangles
  for (let i = 0; i < numSteps; i++) {
    const base0 = i * 4;
    const base1 = (i + 1) * 4;

    // Top face (+radial): v0 and v1
    indices.push(base0 + 0, base1 + 0, base1 + 1);
    indices.push(base0 + 0, base1 + 1, base0 + 1);

    // Bottom face (-radial): v3 and v2
    indices.push(base0 + 2, base1 + 2, base1 + 3);
    indices.push(base0 + 2, base1 + 3, base0 + 3);

    // Side 1 (+binormal): v0 and v3
    indices.push(base0 + 3, base1 + 3, base1 + 0);
    indices.push(base0 + 3, base1 + 0, base0 + 0);

    // Side 2 (-binormal): v1 and v2
    indices.push(base0 + 1, base1 + 1, base1 + 2);
    indices.push(base0 + 1, base1 + 2, base0 + 2);
  }

  // Cap start
  indices.push(0, 2, 1);
  indices.push(0, 3, 2);

  // Cap end
  const lastBase = numSteps * 4;
  indices.push(lastBase + 0, lastBase + 1, lastBase + 2);
  indices.push(lastBase + 0, lastBase + 2, lastBase + 3);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  return { geometry: geo, startPt, endPt };
}

/**
 * Creates a fatty acid ligand chain (spacefill CPK spheres) nested inside hydrophobic clefts
 */
function createFattyAcidChain(
  controlPoints: THREE.Vector3[],
  sphereRadius: number = 0.22,
  carboxylEnd: 'start' | 'end' | 'none' = 'start'
): THREE.Group {
  const chainGroup = new THREE.Group();

  const cMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9, // Pearl white / light gray aliphatic carbons
    roughness: 0.24,
    metalness: 0.12
  });

  const oMat = new THREE.MeshStandardMaterial({
    color: 0xef4444, // Red carboxyl oxygen
    roughness: 0.2,
    metalness: 0.1
  });

  const sphereGeo = new THREE.SphereGeometry(sphereRadius, 16, 16);
  const oGeo = new THREE.SphereGeometry(sphereRadius * 0.95, 16, 16);

  // Subdivide along control points to place 10-14 overlapping atoms
  const curve = new THREE.CatmullRomCurve3(controlPoints);
  const numAtoms = Math.max(8, Math.round(curve.getLength() / (sphereRadius * 1.35)));

  for (let i = 0; i <= numAtoms; i++) {
    const t = i / numAtoms;
    const pt = curve.getPoint(t);
    // Add slight zigzag to mimic tetrahedral carbon-carbon chain
    const perp = new THREE.Vector3(
      Math.sin(i * 1.8) * 0.08,
      Math.cos(i * 1.8) * 0.08,
      Math.sin(i * 2.3) * 0.08
    );
    const atomPos = pt.clone().add(perp);

    const isOxygen =
      (carboxylEnd === 'start' && i <= 1) ||
      (carboxylEnd === 'end' && i >= numAtoms - 1);

    const mesh = new THREE.Mesh(isOxygen ? oGeo : sphereGeo, isOxygen ? oMat : cMat);
    mesh.position.copy(atomPos);
    mesh.castShadow = true;
    chainGroup.add(mesh);
  }

  return chainGroup;
}

/**
 * Builds the complete 3D Human Serum Albumin (HSA) ribbon cartoon model
 */
export function buildProteinRibbonModel(): THREE.Group {
  const proteinGroup = new THREE.Group();
  proteinGroup.name = 'protein_hsa_model';

  // Materials
  const helixMaterial = new THREE.MeshStandardMaterial({
    color: 0xd32f2f, // Vibrant crimson red matching reference image
    roughness: 0.32,
    metalness: 0.14,
    side: THREE.DoubleSide
  });

  const loopMaterial = new THREE.MeshStandardMaterial({
    color: 0x16a34a, // Vibrant green loop matching reference image
    roughness: 0.38,
    metalness: 0.08
  });

  // Definition of the 14 alpha-helices comprising the 3 domains of HSA
  // Domain I (lower-left 3-helix bundle), Domain II (upper heart/apex), Domain III (bottom/right floor)
  const helixDefs: Array<{
    id: string;
    start: THREE.Vector3;
    end: THREE.Vector3;
    turns: number;
    radius?: number;
    width?: number;
    phase?: number;
  }> = [
    // --- Domain I (Lower Left Bundle) ---
    {
      id: 'H1_IA_outer',
      start: new THREE.Vector3(-3.4, -2.1, 0.4),
      end: new THREE.Vector3(-3.6, 0.4, 0.7),
      turns: 5.5,
      radius: 0.42,
      phase: 0.2
    },
    {
      id: 'H2_IA_mid',
      start: new THREE.Vector3(-2.8, 0.3, 0.5),
      end: new THREE.Vector3(-2.4, -1.8, 0.2),
      turns: 4.8,
      radius: 0.40,
      phase: 1.5
    },
    {
      id: 'H3_IA_inner',
      start: new THREE.Vector3(-1.8, -1.5, 0.0),
      end: new THREE.Vector3(-1.3, -0.2, -0.1),
      turns: 3.5,
      radius: 0.38,
      phase: 2.8
    },

    // --- Domain II (Upper Crown & Apex Bundle) ---
    {
      id: 'H4_IIA_asc',
      start: new THREE.Vector3(-1.1, 1.8, 0.6),
      end: new THREE.Vector3(0.3, 3.1, 0.3),
      turns: 4.5,
      radius: 0.42,
      phase: 0.5
    },
    {
      id: 'H5_IIA_top',
      start: new THREE.Vector3(1.0, 3.0, -0.1),
      end: new THREE.Vector3(2.5, 2.3, -0.6),
      turns: 4.2,
      radius: 0.40,
      phase: 2.0
    },
    {
      id: 'H6_IIB_right',
      start: new THREE.Vector3(2.4, 1.7, -0.8),
      end: new THREE.Vector3(1.7, 0.3, -0.7),
      turns: 3.8,
      radius: 0.38,
      phase: 1.0
    },
    {
      id: 'H7_IIB_inner_pocket',
      start: new THREE.Vector3(0.9, 0.4, -0.2),
      end: new THREE.Vector3(0.3, 1.9, 0.4),
      turns: 4.0,
      radius: 0.40,
      phase: 3.2
    },
    {
      id: 'H8_IIB_cross',
      start: new THREE.Vector3(-0.3, 1.6, 0.7),
      end: new THREE.Vector3(0.8, 1.1, 0.8),
      turns: 3.0,
      radius: 0.38,
      phase: 0.8
    },

    // --- Domain III (Central & Bottom Right Helices) ---
    {
      id: 'H9_IIIA_mid',
      start: new THREE.Vector3(-0.3, -0.5, 0.6),
      end: new THREE.Vector3(1.0, -0.8, 0.4),
      turns: 3.6,
      radius: 0.40,
      phase: 2.2
    },
    {
      id: 'H10_IIIB_long_base',
      start: new THREE.Vector3(0.8, -1.5, 0.3),
      end: new THREE.Vector3(2.8, -2.2, -0.1),
      turns: 5.8,
      radius: 0.42,
      phase: 0.3
    },
    {
      id: 'H11_IIIB_term_wing',
      start: new THREE.Vector3(2.8, -2.0, -0.5),
      end: new THREE.Vector3(1.4, -1.4, -0.8),
      turns: 3.8,
      radius: 0.38,
      phase: 1.7
    },
    {
      id: 'H12_IIIA_rear',
      start: new THREE.Vector3(0.5, -0.4, -0.7),
      end: new THREE.Vector3(-0.7, -0.6, -0.5),
      turns: 3.4,
      radius: 0.38,
      phase: 3.0
    },
    {
      id: 'H13_IIIA_bridge',
      start: new THREE.Vector3(-0.8, -1.3, 0.1),
      end: new THREE.Vector3(0.2, -1.8, 0.1),
      turns: 3.0,
      radius: 0.36,
      phase: 0.4
    }
  ];

  // Store helix endpoints to stitch connecting green loops
  const helixEndpoints: Array<{ startPt: THREE.Vector3; endPt: THREE.Vector3 }> = [];

  // 1. Build all Alpha-Helix Ribbons
  helixDefs.forEach(def => {
    const { geometry, startPt, endPt } = createHelixRibbonGeometry(
      def.start,
      def.end,
      def.turns,
      def.radius ?? 0.40,
      def.width ?? 0.36,
      0.08,
      def.phase ?? 0
    );
    const mesh = new THREE.Mesh(geometry, helixMaterial);
    mesh.castShadow = true;
    proteinGroup.add(mesh);
    helixEndpoints.push({ startPt, endPt });
  });

  // 2. Build connecting Green Loops (Random coils / Turns)
  const loopSpecs = [
    // Loop 0 -> 1: H1 end to H2 start (Domain I top turnaround)
    {
      from: 0,
      to: 1,
      mids: [new THREE.Vector3(-3.2, 0.6, 0.8), new THREE.Vector3(-2.9, 0.6, 0.6)]
    },
    // Loop 1 -> 2: H2 end to H3 start (Domain I bottom turnaround)
    {
      from: 1,
      to: 2,
      mids: [new THREE.Vector3(-2.2, -2.0, 0.1), new THREE.Vector3(-1.9, -1.8, 0.0)]
    },
    // Loop 2 -> 3: H3 end to H4 start (Connecting Domain I to Domain II)
    {
      from: 2,
      to: 3,
      mids: [new THREE.Vector3(-1.4, 0.5, 0.2), new THREE.Vector3(-1.6, 1.2, 0.5)]
    },
    // Loop 3 -> 4: H4 end to H5 start (Upper apex crest)
    {
      from: 3,
      to: 4,
      mids: [new THREE.Vector3(0.6, 3.3, 0.1), new THREE.Vector3(0.9, 3.2, -0.1)]
    },
    // Loop 4 -> 5: H5 end to H6 start (Apex right shoulder)
    {
      from: 4,
      to: 5,
      mids: [new THREE.Vector3(2.7, 2.1, -0.8), new THREE.Vector3(2.6, 1.9, -0.8)]
    },
    // Loop 5 -> 6: H6 end to H7 start (Domain IIB bottom loop into pocket)
    {
      from: 5,
      to: 6,
      mids: [new THREE.Vector3(1.4, 0.1, -0.5), new THREE.Vector3(1.1, 0.2, -0.3)]
    },
    // Loop 6 -> 7: H7 end to H8 start (Upper interior loop)
    {
      from: 6,
      to: 7,
      mids: [new THREE.Vector3(0.0, 2.0, 0.5), new THREE.Vector3(-0.2, 1.8, 0.6)]
    },
    // Loop 7 -> 8: H8 end to H9 start (From Domain II into Domain III)
    {
      from: 7,
      to: 8,
      mids: [new THREE.Vector3(0.7, 0.4, 0.8), new THREE.Vector3(0.1, -0.1, 0.8)]
    },
    // Loop 8 -> 9: H9 end to H10 start (Domain III mid to long base)
    {
      from: 8,
      to: 9,
      mids: [new THREE.Vector3(1.2, -1.1, 0.4), new THREE.Vector3(1.0, -1.3, 0.3)]
    },
    // Loop 9 -> 10: H10 end to H11 start (Far right hairpin turn)
    {
      from: 9,
      to: 10,
      mids: [new THREE.Vector3(3.1, -2.3, -0.3), new THREE.Vector3(3.0, -2.1, -0.5)]
    },
    // Loop 10 -> 11: H11 end to H12 start (Rear floor connector)
    {
      from: 10,
      to: 11,
      mids: [new THREE.Vector3(1.0, -1.0, -0.8), new THREE.Vector3(0.7, -0.6, -0.7)]
    },
    // Loop 11 -> 12: H12 end to H13 start (Bottom center turnaround)
    {
      from: 11,
      to: 12,
      mids: [new THREE.Vector3(-1.0, -0.8, -0.2), new THREE.Vector3(-0.9, -1.1, 0.0)]
    }
  ];

  loopSpecs.forEach(spec => {
    const startP = helixEndpoints[spec.from].endPt;
    const endP = helixEndpoints[spec.to].startPt;
    const pts = [startP, ...spec.mids, endP];
    const curve = new THREE.CatmullRomCurve3(pts);
    const loopGeo = new THREE.TubeGeometry(curve, 22, 0.045, 8, false);
    const loopMesh = new THREE.Mesh(loopGeo, loopMaterial);
    loopMesh.castShadow = true;
    proteinGroup.add(loopMesh);
  });

  // 3. Build Bound Fatty Acid Ligand Chains (Pearl-White Spacefill Spheres with red carboxyl tips)
  // Matching the exact positions seen in the user's uploaded reference image:
  // - FA1 in Domain I lower-left pocket between H1 and H2
  // - FA2 in Domain II upper central channel (prominent vertical chain of white spheres)
  // - FA3 tucked under apex arch
  // - FA4 along the bottom horizontal cleft near H10
  // - FA5 in rear hydrophobic groove
  const fattyAcids = [
    // FA1: Lower-left domain between H1 and H2 (8-10 spheres)
    {
      points: [
        new THREE.Vector3(-2.6, 0.1, 0.5),
        new THREE.Vector3(-2.7, -0.4, 0.45),
        new THREE.Vector3(-2.8, -0.9, 0.4),
        new THREE.Vector3(-2.9, -1.4, 0.35),
        new THREE.Vector3(-3.0, -1.8, 0.3)
      ],
      carboxylEnd: 'start' as const
    },
    // FA2: Upper central cleft (prominent vertical fatty acid chain, 12+ spheres)
    {
      points: [
        new THREE.Vector3(0.7, 2.7, -0.1),
        new THREE.Vector3(0.8, 2.2, 0.0),
        new THREE.Vector3(0.9, 1.7, 0.1),
        new THREE.Vector3(0.9, 1.2, 0.2),
        new THREE.Vector3(0.8, 0.7, 0.25),
        new THREE.Vector3(0.6, 0.2, 0.3),
        new THREE.Vector3(0.4, -0.2, 0.35)
      ],
      carboxylEnd: 'start' as const
    },
    // FA3: Upper left diagonal pocket (under H4)
    {
      points: [
        new THREE.Vector3(-0.8, 1.4, 0.5),
        new THREE.Vector3(-0.6, 0.9, 0.4),
        new THREE.Vector3(-0.3, 0.4, 0.3),
        new THREE.Vector3(0.0, 0.0, 0.2)
      ],
      carboxylEnd: 'end' as const
    },
    // FA4: Lower right horizontal cleft above H10 (running through Domain III)
    {
      points: [
        new THREE.Vector3(1.2, -1.2, 0.1),
        new THREE.Vector3(1.6, -1.4, 0.0),
        new THREE.Vector3(2.0, -1.6, -0.1),
        new THREE.Vector3(2.3, -1.8, -0.2)
      ],
      carboxylEnd: 'start' as const
    },
    // FA5: Center-bottom interior cluster
    {
      points: [
        new THREE.Vector3(0.1, -0.8, -0.1),
        new THREE.Vector3(0.3, -0.8, -0.3),
        new THREE.Vector3(0.5, -0.9, -0.5),
        new THREE.Vector3(0.7, -1.0, -0.6)
      ],
      carboxylEnd: 'none' as const
    }
  ];

  fattyAcids.forEach(fa => {
    const chain = createFattyAcidChain(fa.points, 0.22, fa.carboxylEnd);
    proteinGroup.add(chain);
  });

  return proteinGroup;
}
