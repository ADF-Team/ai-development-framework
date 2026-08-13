import { z } from 'zod'
import { messages } from '@/constants/messages'

export const updateUserSchema = z
  .object({
    role: z
      .enum(['user', 'admin'], {
        message: messages.adminUsers.validation.roleInvalid,
      })
      .optional(),
    status: z
      .enum(['active', 'disabled'], {
        message: messages.adminUsers.validation.statusInvalid,
      })
      .optional(),
  })
  .refine((data) => data.role !== undefined || data.status !== undefined, {
    message: messages.adminUsers.validation.noUpdateFields,
  })

export type UpdateUserInput = z.infer<typeof updateUserSchema>
