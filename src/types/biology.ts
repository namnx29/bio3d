export interface BioEntity {
  id: string;
  name: string;
  vietnameseName: string;
  category: 'atom' | 'molecule' | 'macromolecule' | 'virus' | 'prokaryote' | 'organelle' | 'eukaryote' | 'macro';
  scaleLabel: string;
  scaleValueMeters: number; // in meters
  scaleLogPosition: number; // normalized position along the 3D ruler (-35 to +35)
  microscopeType: 'electron' | 'optical' | 'naked_eye';
  microscopeLabel: string;
  summary: string;
  description: string;
  keyFeatures: string[];
  dimensions: string;
  curriculumNotes: string;
  modelType: string;
  position3D: [number, number, number];
  color: string;
}

export type ProkaryoteStructureId = 
  | 'capsule'
  | 'cell_wall'
  | 'plasma_membrane'
  | 'cytoplasm'
  | 'ribosome'
  | 'nucleoid'
  | 'plasmid'
  | 'flagellum'
  | 'pili';

export interface ProkaryoteStructureDetail {
  id: ProkaryoteStructureId;
  name: string;
  vietnameseName: string;
  location: string;
  chemicalComposition: string;
  functionText: string;
  curriculumNotes: string;
  color: string;
  defaultVisible: boolean;
  canExplode: boolean;
  layerIndex: number; // 0 = capsule, 1 = cell wall, 2 = membrane, 3 = cytoplasm, 4 = nucleoid
}

export type MagnificationLevel = 
  | 1 // Toàn bộ tế bào
  | 2 // Từng lớp cấu trúc
  | 3 // Tế bào chất
  | 4; // Siêu vi: Ribosome / DNA vòng / Màng kép phospholipid

export interface InteractiveTask {
  id: string;
  type: 'identify_3d' | 'match_pairs' | 'sort_layers' | 'scenario' | 'compare_task' | 'mystery_challenge';
  title: string;
  question: string;
  targetStructureId?: ProkaryoteStructureId;
  options?: string[];
  correctAnswer?: number | string | string[];
  explanation: string;
  pairs?: { structure: string; func: string; id: string }[];
  layersToSort?: { id: string; name: string }[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export type ActiveModule = 
  | '01_scale'
  | '02_bacteria'
  | '03_prokaryote_structure'
  | '04_compare'
  | '05_cell_wall';

