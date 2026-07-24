import { z } from 'zod'
import { messages } from '@/constants/messages'
import { NAME_MAX_LENGTH } from '@/constants/validation'

export const inviteUserFormSchema = z.object({
  email: z.email(messages.adminUsers.validation.emailInvalid),
  displayName: z
    .string()
    .trim()
    .min(1, messages.adminUsers.validation.displayNameRequired)
    .max(NAME_MAX_LENGTH, messages.adminUsers.validation.displayNameTooLong),
  role: z.enum(['user', 'admin']),
})

export type InviteUserFormValues = z.infer<typeof inviteUserFormSchema>
