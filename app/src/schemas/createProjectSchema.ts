import { z } from 'zod'
import { messages } from '@/constants/messages'
import { NAME_MAX_LENGTH } from '@/constants/validation'

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, messages.projects.validation.nameRequired)
    .max(NAME_MAX_LENGTH, messages.projects.validation.nameTooLong),
  templateId: z
    .string()
    .trim()
    .min(1, messages.projects.validation.templateRequired),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
