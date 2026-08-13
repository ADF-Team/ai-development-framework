import { z } from 'zod'
import { messages } from '@/constants/messages'
import {
  DISPLAY_NAME_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
} from '@/constants/validation'

export const inviteUserSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email(messages.adminUsers.validation.emailInvalid)
    .max(EMAIL_MAX_LENGTH, messages.adminUsers.validation.emailTooLong),
  displayName: z
    .string()
    .trim()
    .min(1, messages.adminUsers.validation.displayNameRequired)
    .max(
      DISPLAY_NAME_MAX_LENGTH,
      messages.adminUsers.validation.displayNameTooLong
    ),
  role: z.enum(['user', 'admin'], {
    message: messages.adminUsers.validation.roleInvalid,
  }),
})

export type InviteUserInput = z.infer<typeof inviteUserSchema>
