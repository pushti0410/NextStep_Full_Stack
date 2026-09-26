export type UrgencyLevel = 'critical' | 'high' | 'medium' | 'low';

export interface PriorityItem {
  id: string;
  title: string;
  rank: number;
  urgency: UrgencyLevel;
  impact: string;
  recommendedAction: string;
  isTied?: boolean;
  confidence?: number;
}

export interface ConstraintItem {
  id: string;
  description: string;
  type: 'financial' | 'time' | 'interpersonal' | 'health' | 'academic_career' | 'general';
}

export interface StructuredResponse {
  mode: 'normal' | 'calm_safety' | 'degraded_fallback';
  summary: string;
  identifiedIssues: string[];
  priorities: PriorityItem[];
  constraints: ConstraintItem[];
  recommendedNextAction: string;
  clarificationQuestions: string[];
  atRiskFlag: boolean;
  riskGuidance?: string | null;
  confidenceScore: number;
}

export interface DeltaSummary {
  previousVersion: number;
  currentVersion: number;
  deadlineShift?: {
    oldVal?: string;
    newVal?: string;
    resolvedVal?: string;
  } | null;
  priorityChanges: string[];
  resolvedIssues: string[];
  newIssues: string[];
  summaryDelta: string;
}

export interface SituationVersion {
  id: string;
  situationId: string;
  version: number;
  rawInput: string;
  timestamp: string;
  structuredResponse: StructuredResponse;
  deltaSummary?: DeltaSummary | null;
  isDegraded: boolean;
  idempotencyKey?: string;
}

export interface Situation {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  currentVersionNumber: number;
  latestResponse: StructuredResponse;
}
