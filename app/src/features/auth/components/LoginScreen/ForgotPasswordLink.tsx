'use client'

import { useState } from 'react'
import { messages } from '@/constants/messages'
import { sendResetPasswordEmail } from '@/features/auth/utils/authClient'

interface ForgotPasswordLinkProps {
  email: string
}

type Status = 'idle' | 'sending' | 'sent' | 'error' | 'email-required'

// パスワードリセットメールの送信フローへの導線
export function ForgotPasswordLink({ email }: ForgotPasswordLinkProps) {
  const [status, setStatus] = useState<Status>('idle')

  // 入力済みのメールアドレス宛にパスワードリセットメールを送信する
  const handleClick = async () => {
    if (!email) {
      setStatus('email-required')
      return
    }
    setStatus('sending')
    const result = await sendResetPasswordEmail(email)
    setStatus(result === 'sent' ? 'sent' : 'error')
  }

  return (
    <div className="mt-0.5 text-center">
      <button
        type="button"
        onClick={handleClick}
        disabled={status === 'sending'}
        className="text-[12px] text-text/55 underline hover:text-accent disabled:cursor-not-allowed"
      >
        {messages.auth.forgotPasswordLink}
      </button>
      {status === 'sent' && (
        <p className="mt-1 text-[12px] text-text/55">
          {messages.auth.forgotPasswordSent}
        </p>
      )}
      {status === 'email-required' && (
        <p className="mt-1 text-[12px] text-danger">
          {messages.auth.forgotPasswordEmailRequired}
        </p>
      )}
      {status === 'error' && (
        <p className="mt-1 text-[12px] text-danger">
          {messages.auth.errorMessage.other}
        </p>
      )}
    </div>
  )
}
