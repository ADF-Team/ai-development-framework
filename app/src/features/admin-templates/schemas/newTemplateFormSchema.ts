import { z } from 'zod'
import { messages } from '@/constants/messages'
import { NAME_MAX_LENGTH } from '@/constants/validation'

export const newTemplateFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, messages.adminTemplates.validation.titleRequired)
    .max(NAME_MAX_LENGTH, messages.adminTemplates.validation.titleTooLong),
})

export type NewTemplateFormValues = z.infer<typeof newTemplateFormSchema>
