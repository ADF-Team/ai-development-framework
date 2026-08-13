import type { StageKey } from './Project'

export interface TemplateQuestion {
  id: string
  text: string
  order: number
}

export interface TemplateQualityGateItem {
  id: string
  label: string
  order: number
}

export interface TemplateVersionSummary {
  version: number
  createdAt: string
  createdBy: string
}

export interface TemplateSummary {
  id: string
  title: string
  version: number
  updatedAt: string
  updatedBy: string
  isPublished: boolean
  // 公開テンプレートを複製した直後・未編集の場合にtrue（新しいバージョンが保存されると自動的にfalseになる）
  showPublishedTag: boolean
}

export interface StageTemplateData {
  templateId: string
  stageKey: StageKey
  title: string
  questions: TemplateQuestion[]
  promptTemplate: string
  qualityGateItems: TemplateQualityGateItem[]
  version: number
}

export interface StageTemplateDetail extends StageTemplateData {
  versions: TemplateVersionSummary[]
  isPublished: boolean
}
