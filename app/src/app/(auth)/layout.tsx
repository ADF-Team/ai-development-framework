import { redirect } from 'next/navigation'
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/nav/AppSidebar'
import { getCurrentUser } from '@/lib/api/auth/getCurrentUser'

// 認証必須画面（(auth)グループ）共通レイアウト。開閉可能なサイドバーナビゲーションを付与する
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  return (
    <SidebarProvider>
      <AppSidebar
        userDisplayName={user.displayName ?? user.email}
        role={user.role}
      />
      <SidebarInset>
        <SidebarTrigger className="m-2" />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
