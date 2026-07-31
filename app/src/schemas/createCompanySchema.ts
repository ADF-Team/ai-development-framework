import { z } from 'zod'
import { messages } from '@/constants/messages'
import { NAME_MAX_LENGTH } from '@/constants/validation'

export const createCompanySchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(1, messages.companyManagement.validation.nameRequired)
    .max(NAME_MAX_LENGTH, messages.companyManagement.validation.nameTooLong),
  adminEmail: z.email(messages.companyManagement.validation.emailInvalid),
  adminDisplayName: z
    .string()
    .trim()
    .min(1, messages.companyManagement.validation.adminNameRequired)
    .max(
      NAME_MAX_LENGTH,
      messages.companyManagement.validation.adminNameTooLong
    ),
})

export type CreateCompanyInput = z.infer<typeof createCompanySchema>
