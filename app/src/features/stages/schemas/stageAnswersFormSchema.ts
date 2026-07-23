import { z } from 'zod'
import { messages } from '@/constants/messages'

export const stageAnswersFormSchema = z
  .record(z.string(), z.string())
  .refine(
    (answers) => Object.values(answers).some((value) => value.trim() !== ''),
    { message: messages.stages.validation.answerRequired }
  )

export type StageAnswersFormValues = z.infer<typeof stageAnswersFormSchema>
