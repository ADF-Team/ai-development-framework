import { z } from 'zod'
import { messages } from '@/constants/messages'
import {
  DISPLAY_NAME_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
} from '@/constants/validation'

export const createCompanySchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(1, messages.companyManagement.validation.nameRequired)
    .max(NAME_MAX_LENGTH, messages.companyManagement.validation.nameTooLong),
  adminEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email(messages.companyManagement.validation.emailInvalid)
    .max(EMAIL_MAX_LENGTH, messages.companyManagement.validation.emailTooLong),
  adminDisplayName: z
    .string()
    .trim()
    .min(1, messages.companyManagement.validation.adminNameRequired)
    .max(
      DISPLAY_NAME_MAX_LENGTH,
      messages.companyManagement.validation.adminNameTooLong
    ),
})

export type CreateCompanyInput = z.infer<typeof createCompanySchema>
