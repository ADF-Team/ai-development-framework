import { z } from 'zod'
import { messages } from '@/constants/messages'

export const deliverableContentFormSchema = z.object({
  content: z.string().trim().min(1, messages.stages.validation.contentRequired),
})

export type DeliverableContentFormValues = z.infer<
  typeof deliverableContentFormSchema
>
