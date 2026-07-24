'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { messages } from '@/constants/messages'
import { NAME_MAX_LENGTH } from '@/constants/validation'
import { useApiAction } from '@/hooks/useApiAction'
import { postInviteUser } from '@/lib/api/adminUsers/postInviteUser'
import { inviteUserFormSchema } from '../../schemas/inviteUserFormSchema'
import type { UserListItem, UserRole } from '@/types/User'

// ユーザー管理画面：メンバー招待モーダル（メールアドレス・ロール・表示名を指定して招待する）
export function InviteUserModal({
  open,
  onOpenChange,
  onInvited,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvited: (user: UserListItem) => void
}) {
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState<UserRole>('user')
  const [errorMessage, setErrorMessage] = useState('')
  const { run, isLoading } = useApiAction(postInviteUser)

  // モーダルを閉じる際、開き方（キャンセル操作／Escape／外側クリック）によらず入力値とエラーメッセージをリセットする
  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setEmail('')
      setDisplayName('')
      setRole('user')
      setErrorMessage('')
    }
    onOpenChange(next)
  }

  const handleInvite = async () => {
    const validation = inviteUserFormSchema.safeParse({
      email,
      displayName,
      role,
    })
    if (!validation.success) {
      setErrorMessage(validation.error.issues[0].message)
      return
    }
    setErrorMessage('')

    const user = await run(email, role, displayName)
    if (user) {
      onInvited(user)
      handleOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{messages.adminUsers.inviteModal.title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="invite-user-email">
            {messages.adminUsers.inviteModal.emailLabel}
          </Label>
          <Input
            id="invite-user-email"
            type="email"
            placeholder={messages.adminUsers.inviteModal.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="invite-user-name">
            {messages.adminUsers.inviteModal.nameLabel}
          </Label>
          <Input
            id="invite-user-name"
            placeholder={messages.adminUsers.inviteModal.namePlaceholder}
            value={displayName}
            maxLength={NAME_MAX_LENGTH}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>{messages.adminUsers.inviteModal.roleLabel}</Label>
          <div className="flex overflow-hidden rounded-md border border-divider">
            <button
              type="button"
              onClick={() => setRole('user')}
              className={cn(
                'flex-1 rounded-l-md border-r border-divider px-3 py-1.5 text-[13px]',
                role === 'user'
                  ? 'text-accent shadow-[inset_0_0_0_1px_var(--color-accent)]'
                  : 'hover:bg-text/7'
              )}
            >
              {messages.adminUsers.roleLabel.user}
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={cn(
                'flex-1 rounded-r-md px-3 py-1.5 text-[13px]',
                role === 'admin'
                  ? 'text-accent shadow-[inset_0_0_0_1px_var(--color-accent)]'
                  : 'hover:bg-text/7'
              )}
            >
              {messages.adminUsers.roleLabel.admin}
            </button>
          </div>
        </div>

        <p className="text-[12px] text-text/70">
          {messages.adminUsers.inviteModal.description}
        </p>

        {errorMessage && (
          <p className="text-[13px] text-destructive">{errorMessage}</p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleOpenChange(false)}
          >
            {messages.adminUsers.inviteModal.cancelButton}
          </Button>
          <Button type="button" disabled={isLoading} onClick={handleInvite}>
            {messages.adminUsers.inviteModal.inviteButton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
