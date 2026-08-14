import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/api/auth/getCurrentUser'

// 管理者用画面（(auth)/adminグループ）共通レイアウト。admin・system_admin以外は/projectsへリダイレクトする
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }
  if (user.role !== 'admin' && user.role !== 'system_admin') {
    redirect('/projects')
  }

  return children
}
