export type GenerationMethod = 'manual' | 'ai_executed'

export interface DeliverableData {
  id: string
  version: number
  content: string
  generationMethod: GenerationMethod
}
