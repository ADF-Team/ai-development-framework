import { z } from 'zod'
import { messages } from '@/constants/messages'

export const loginFormSchema = z.object({
  email: z.email(messages.auth.validation.emailInvalid),
  password: z.string().min(1, messages.auth.validation.passwordRequired),
})

export type LoginFormValues = z.infer<typeof loginFormSchema>
