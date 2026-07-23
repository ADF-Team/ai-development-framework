import type { StageKey, StageStatus } from './Project'
import type { DeliverableData } from './Deliverable'

export type ExecutionMode = 'prompt_only' | 'ai_executed'

export interface StageQuestion {
  id: string
  text: string
  order: number
}

export interface QualityGateItem {
  id: string
  label: string
  order: number
}

export interface QualityGateResultEntry {
  checked: boolean
}

export interface StageDetail {
  stageKey: StageKey
  status: StageStatus
  questions: StageQuestion[]
  answers: Record<string, string>
  generatedPrompt: string
  deliverable: DeliverableData | null
  qualityGateItems: QualityGateItem[]
  qualityGateResult: Record<string, QualityGateResultEntry>
}
