import { z } from 'zod'

export const postStageAnswersSchema = z.object({
  answers: z.record(z.string(), z.string()),
})

export type PostStageAnswersInput = z.infer<typeof postStageAnswersSchema>
