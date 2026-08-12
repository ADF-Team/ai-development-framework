import { z } from 'zod'
import { messages } from '@/constants/messages'
import { NAME_MAX_LENGTH } from '@/constants/validation'
import { COMPANY_STATUS_VALUES } from '@/types/Company'

export const updateCompanySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, messages.companyManagement.validation.nameRequired)
      .max(NAME_MAX_LENGTH, messages.companyManagement.validation.nameTooLong)
      .optional(),
    status: z
      .enum(COMPANY_STATUS_VALUES, {
        message: messages.companyManagement.validation.statusInvalid,
      })
      .optional(),
  })
  .refine((data) => data.name !== undefined || data.status !== undefined, {
    message: messages.companyManagement.validation.noUpdateFields,
  })

export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>
