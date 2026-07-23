export type StageKey =
  | 'requirements'
  | 'design'
  | 'implementation'
  | 'review'
  | 'security'
  | 'test'
  | 'documentation'

// 7工程の並び順（サーバー・クライアントの両方から参照する唯一の定義元）
export const STAGE_ORDER: StageKey[] = [
  'requirements',
  'design',
  'implementation',
  'review',
  'security',
  'test',
  'documentation',
]

export type StageStatus =
  'not_started' | 'in_progress' | 'quality_gate_pending' | 'completed'

export type OverallStatus = 'in_progress' | 'completed'

export interface ProjectListItem {
  id: string
  name: string
  overallStatus: OverallStatus
  currentStage: StageKey
  stageStatuses: Record<StageKey, StageStatus>
  createdAt: string
}

export interface ProjectStageSummary {
  stageKey: StageKey
  status: StageStatus
}

export interface ProjectDetail {
  id: string
  name: string
  overallStatus: OverallStatus
  currentStage: StageKey
  stages: ProjectStageSummary[]
}
