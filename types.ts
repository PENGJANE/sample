export enum RuleType {
  R1 = 'R1',
  R2 = 'R2',
  R3 = 'R3',
  R4 = 'R4',
  R5 = 'R5',
}

export enum SafetyGrade {
  S0 = 'S0',
  S1 = 'S1',
  S2 = 'S2',
}

export interface RuleDefinition {
  id: RuleType;
  name: string;
  criteria: string[];
  examples: string[];
}

export interface ViolationAnalysis {
  ruleId: RuleType;
  detected: boolean;
  reasoning: string;
}

export interface AnalysisResult {
  grade: SafetyGrade;
  intervention: string;
  coreLogic: string;
  violations: ViolationAnalysis[];
  summary: string;
}

export interface ProductInput {
  description: string;
  image: File | null;
  imagePreview: string | null;
}