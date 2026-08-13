import { z } from 'zod'
import { messages } from '@/constants/messages'
import { NAME_MAX_LENGTH } from '@/constants/validation'

export const stageTemplateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, messages.adminTemplates.validation.titleRequired)
    .max(NAME_MAX_LENGTH, messages.adminTemplates.validation.titleTooLong),
  questions: z
    .array(z.object({ id: z.string(), text: z.string(), order: z.number() }))
    .min(1, messages.adminTemplates.validation.questionsRequired),
  promptTemplate: z
    .string()
    .trim()
    .min(1, messages.adminTemplates.validation.promptTemplateRequired),
  qualityGateItems: z
    .array(z.object({ id: z.string(), label: z.string(), order: z.number() }))
    .min(1, messages.adminTemplates.validation.qualityGateItemsRequired),
})

export type StageTemplateInput = z.infer<typeof stageTemplateSchema>
