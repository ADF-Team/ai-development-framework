'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Building2, Folders, Globe, Layers, LogOut, Users } from 'lucide-react'
import { messages } from '@/constants/messages'
import type { UserRole } from '@/types/User'
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

// TODO: getCurrentUser()実装後、実際のログインユーザーのロールに置き換える
function getCurrentUserRole(): UserRole {
  return 'system_admin'
}

// 認証必須画面（(auth)グループ）で共通のサイドバーナビゲーション
export function AppSidebar() {
  const pathname = usePathname()

  const role = getCurrentUserRole()
  const isAdmin = role === 'admin' || role === 'system_admin'
  const isSystemAdmin = role === 'system_admin'

  const teamSpaceItems = isAdmin
    ? TEAM_SPACE_ITEMS
    : TEAM_SPACE_ITEMS.filter((item) => item.href === '/projects')

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
          <span className="font-heading text-xl font-medium group-data-[collapsible=icon]:hidden">
            {messages.common.brand}
          </span>
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
        {/* TODO: getCurrentUser()実装後、実際のログインユーザー情報に置き換える */}
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 flex-none items-center justify-center rounded-full bg-accent-800 font-heading text-xs text-accent-100">
            {messages.nav.mockUserName.slice(0, 1)}
          </div>
          <div className="flex min-w-0 flex-col gap-0.5 group-data-[collapsible=icon]:hidden">
            <span className="text-[13px]">{messages.nav.mockUserName}</span>
            <span className="w-fit rounded-[6px] bg-accent-800 px-2.5 py-0.75 text-[11px] text-accent-100">
              {ROLE_LABEL[role]}
            </span>
          </div>
        </div>

        {/* TODO: signOut（Firebase）＋セッションCookie失効を実装する */}
        <button className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm text-accent hover:bg-accent/10">
          <LogOut className="size-4 shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden">
            {messages.nav.logout}
          </span>
        </button>
      </SidebarFooter>
    </Sidebar>
  )
}
