'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { messages } from '@/constants/messages'
import { Card } from '@/components/ui/card'
import { LoginForm } from './LoginScreen/LoginForm'

// ログイン画面（/login）のエントリーポイント
export function LoginScreen() {
  return (
    <div className="relative flex min-h-screen flex-1 items-center justify-center bg-bg p-8 text-text">
      <Link
        href="/"
        className="absolute top-6 left-6 inline-flex items-center gap-1 text-[13px] text-text/60"
      >
        <ArrowLeft className="size-3.5" />
        {messages.auth.back}
      </Link>

      <Card className="w-95 gap-[8.4px] rounded-lg border-none p-[11.2px] shadow-lg">
        <div className="mb-1 flex items-center gap-2.5">
          <Image
            src="/icon.png"
            alt={messages.common.brand}
            width={34}
            height={34}
            className="block"
          />
          <span className="font-heading text-[21px] font-medium">
            {messages.common.brand}
          </span>
        </div>
        <p className="mb-1.5 text-[13px] text-text/55">
          {messages.auth.loginGreeting}
        </p>
        <LoginForm />
      </Card>
    </div>
  )
}
