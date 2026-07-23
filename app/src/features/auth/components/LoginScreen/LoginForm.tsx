'use client'

import { useState, type SubmitEvent } from 'react'
import { useRouter } from 'next/navigation'
import { messages } from '@/constants/messages'
import { signIn } from '@/features/auth/utils/authClient'
import { loginFormSchema } from '@/features/auth/schemas/loginFormSchema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ErrorMessage } from './ErrorMessage'
import { ForgotPasswordLink } from './ForgotPasswordLink'

// メール/パスワード入力とIdentity Platformへのログイン処理を担うフォーム
export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // zodでバリデーション後、signInを呼び出し成功時は案件一覧へ遷移する
  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)

    const validation = loginFormSchema.safeParse({ email, password })
    if (!validation.success) {
      setErrorMessage(validation.error.issues[0].message)
      return
    }

    setIsLoading(true)
    const result = await signIn(validation.data.email, validation.data.password)

    if (result === 'success') {
      router.push('/projects')
      return
    }

    setIsLoading(false)
    setErrorMessage(
      result === 'invalid-credentials'
        ? messages.auth.errorMessage.invalidCredentials
        : messages.auth.errorMessage.other
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-[8.4px]"
    >
      <div>
        <Label htmlFor="email" className="mb-1.25 text-[12px] text-text/70">
          {messages.auth.email}
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={messages.auth.emailPlaceholder}
          className="min-h-9 rounded-md border-divider bg-surface px-2.5 py-1.5 text-sm text-text placeholder:text-text/40 hover:border-text/45 focus-visible:border-accent focus-visible:ring-0"
        />
      </div>
      <div>
        <Label htmlFor="password" className="mb-1.25 text-[12px] text-text/70">
          {messages.auth.password}
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={messages.auth.passwordPlaceholder}
          className="min-h-9 rounded-md border-divider bg-surface px-2.5 py-1.5 text-sm text-text placeholder:text-text/40 hover:border-text/45 focus-visible:border-accent focus-visible:ring-0"
        />
      </div>

      {errorMessage && <ErrorMessage message={errorMessage} />}

      <Button
        type="submit"
        disabled={isLoading}
        variant="outline"
        className="mt-[5.6px] h-auto w-full rounded-md border-accent px-2.5 py-[5.6px] font-heading text-sm font-medium text-accent hover:bg-accent/12 hover:text-accent active:bg-accent/22"
      >
        {messages.auth.loginButton}
      </Button>

      <ForgotPasswordLink email={email} />
    </form>
  )
}
