'use client'

import { Toaster } from 'sonner'

// アプリ全体で使うグローバルプロバイダ（トースト通知等）をまとめる
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster theme="system" richColors />
    </>
  )
}
