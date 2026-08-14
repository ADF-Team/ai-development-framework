'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Building2, Folders, Globe, Layers, LogOut, Users } from 'lucide-react'
import { messages } from '@/constants/messages'
import type { UserRole } from '@/types/User'
import { signOutUser } from '@/features/auth/utils/authClient'
import { showErrorToast } from '@/utils/toast'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar'
import { NavGroup, type NavGroupItem } from './AppSidebar/NavGroup'

const TEAM_SPACE_ITEMS: NavGroupItem[] = [
  { href: '/projects', label: messages.nav.projects, icon: Folders },
  {
    href: '/admin/templates',
    label: messages.nav.adminTemplates,
    icon: Layers,
  },
  { href: '/admin/users', label: messages.nav.adminUsers, icon: Users },
]

const LIBRARY_ITEMS: NavGroupItem[] = [
  {
    href: '/templates/published',
    label: messages.nav.publishedTemplates,
    icon: Globe,
  },
]

const SYSTEM_ADMIN_ITEMS: NavGroupItem[] = [
  {
    href: '/system/companies',
    label: messages.nav.companyManagement,
    icon: Building2,
  },
]

const ROLE_LABEL: Record<UserRole, string> = {
  user: messages.nav.userRoleUser,
  admin: messages.nav.userRoleAdmin,
  system_admin: messages.nav.userRoleSystemAdmin,
}

// 認証必須画面（(auth)グループ）で共通のサイドバーナビゲーション
export function AppSidebar({
  userDisplayName,
  role,
}: {
  userDisplayName: string
  role: UserRole
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const isAdmin = role === 'admin' || role === 'system_admin'
  const isSystemAdmin = role === 'system_admin'

  const teamSpaceItems = isAdmin
    ? TEAM_SPACE_ITEMS
    : TEAM_SPACE_ITEMS.filter((item) => item.href === '/projects')

  // ログアウトし、成功したらログイン画面へ遷移する
  const handleLogout = async () => {
    setIsLoggingOut(true)
    const result = await signOutUser()
    setIsLoggingOut(false)

    if (result === 'error') {
      showErrorToast(messages.nav.logoutError)
      return
    }
    router.push('/')
  }

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      <SidebarHeader className="gap-0 px-1 py-5">
        <Link href="/projects" className="flex items-center gap-2.5">
          <Image
            src="/icon.png"
            alt={messages.common.brand}
            width={40}
            height={40}
            className="block size-10 max-w-none shrink-0"
          />
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-heading text-xl font-medium">
              {messages.common.brand}
            </span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {messages.common.brandFullName}
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-3 px-2">
        <NavGroup
          label={messages.nav.groupTeamSpace}
          items={teamSpaceItems}
          pathname={pathname}
        />
        <NavGroup
          label={messages.nav.groupLibrary}
          items={LIBRARY_ITEMS}
          pathname={pathname}
        />
        {isSystemAdmin && (
          <NavGroup
            label={messages.nav.groupSystemAdmin}
            items={SYSTEM_ADMIN_ITEMS}
            pathname={pathname}
          />
        )}
      </SidebarContent>

      <SidebarFooter className="gap-3 border-t border-divider px-2 pt-4 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 flex-none items-center justify-center rounded-full bg-accent-800 font-heading text-xs text-accent-100">
            {userDisplayName.slice(0, 1)}
          </div>
          <div className="flex min-w-0 flex-col gap-0.5 group-data-[collapsible=icon]:hidden">
            <span className="text-[13px]">{userDisplayName}</span>
            <span className="w-fit rounded-[6px] bg-accent-800 px-2.5 py-0.75 text-[11px] text-accent-100">
              {ROLE_LABEL[role]}
            </span>
          </div>
        </div>

        <button
          type="button"
          disabled={isLoggingOut}
          onClick={handleLogout}
          className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm text-accent hover:bg-accent/10 disabled:pointer-events-none disabled:opacity-50"
        >
          <LogOut className="size-4 shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden">
            {messages.nav.logout}
          </span>
        </button>
      </SidebarFooter>
    </Sidebar>
  )
}
