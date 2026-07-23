export type StageKey =
  | 'requirements'
  | 'design'
  | 'implementation'
  | 'review'
  | 'security'
  | 'test'
  | 'documentation'

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
