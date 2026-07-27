'use client'

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export interface NavGroupItem {
  href: string
  label: string
  icon: LucideIcon
}

// AppSidebarのグループ1つ分（グループ見出し＋ナビ項目リスト）
export function NavGroup({
  label,
  items,
  pathname,
}: {
  label: string
  items: NavGroupItem[]
  pathname: string
}) {
  return (
    <SidebarGroup className="gap-0.5 p-0">
      <SidebarGroupLabel className="h-auto px-2 py-1 text-[11px] font-normal tracking-[0.04em] text-muted-foreground">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                className="h-auto rounded-md px-2 py-2.25 text-sm"
              >
                <Link href={item.href}>
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
