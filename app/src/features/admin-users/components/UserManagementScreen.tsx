'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useAtom } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { Button } from '@/components/ui/button'
import { messages } from '@/constants/messages'
import { userListAtom } from '../stores/userListAtom'
import { UserListTable } from './UserManagementScreen/UserListTable'
import { InviteUserModal } from './UserManagementScreen/InviteUserModal'
import type { UserListItem } from '@/types/User'

// ユーザー管理画面（/admin/users）のエントリーポイント
export function UserManagementScreen({ users }: { users: UserListItem[] }) {
  useHydrateAtoms([[userListAtom, users]])
  const [userList, setUserList] = useAtom(userListAtom)
  const [showInviteModal, setShowInviteModal] = useState(false)

  const handleUpdated = (updated: UserListItem) => {
    setUserList((prev) =>
      prev.map((user) => (user.id === updated.id ? updated : user))
    )
  }

  return (
    <div className="mx-auto w-full max-w-300 flex-1 p-8">
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="font-heading text-[42px] font-semibold">
          {messages.adminUsers.listTitle}
        </h1>
        <Button
          variant="outline"
          className="h-auto gap-1.5 rounded-md border-accent px-2.5 py-[5.6px] font-heading text-sm font-medium text-accent hover:bg-accent/12 hover:text-accent active:bg-accent/22"
          onClick={() => setShowInviteModal(true)}
        >
          <Plus className="size-4" />
          {messages.adminUsers.inviteButton}
        </Button>
      </div>

      <UserListTable users={userList} onUpdated={handleUpdated} />

      <InviteUserModal
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
        onInvited={(user) => setUserList((prev) => [...prev, user])}
      />
    </div>
  )
}
