import type { StageKey } from './Project'
import type { TemplateQuestion, TemplateQualityGateItem } from './StageTemplate'

export interface PublishedTemplateSummary {
  id: string
  title: string
  version: number
  publishedAt: string
}

export interface PublishedTemplateStageContent {
  stageKey: StageKey
  questions: TemplateQuestion[]
  promptTemplate: string
  qualityGateItems: TemplateQualityGateItem[]
}

export interface PublishedTemplateDetail {
  id: string
  title: string
  version: number
  publishedAt: string
  stages: PublishedTemplateStageContent[]
}
