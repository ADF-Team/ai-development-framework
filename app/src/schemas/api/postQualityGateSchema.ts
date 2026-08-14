import { z } from 'zod'

export const postQualityGateSchema = z.object({
  checkedItemIds: z.array(z.string()),
})

export type PostQualityGateInput = z.infer<typeof postQualityGateSchema>
