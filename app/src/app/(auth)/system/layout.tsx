import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/api/auth/getCurrentUser'

// システム管理者用画面（(auth)/systemグループ）共通レイアウト。system_admin以外は/projectsへリダイレクトする
export default async function SystemLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }
  if (user.role !== 'system_admin') {
    redirect('/projects')
  }

  return children
}
