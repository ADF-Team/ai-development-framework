import { Ban, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { messages } from '@/constants/messages'
import { useApiAction } from '@/hooks/useApiAction'
import { patchUser } from '@/lib/frontend/apiClient/adminUsers/patchUser'
import type { UserListItem } from '@/types/User'

// ユーザー管理画面：メンバー一覧の1行分のアカウント無効化／再有効化ボタン
export function DisableUserButton({
  user,
  onUpdated,
}: {
  user: UserListItem
  onUpdated: (user: UserListItem) => void
}) {
  const { run, isLoading } = useApiAction(patchUser)
  const isDisabled = user.status === 'disabled'

  const handleClick = async () => {
    const updated = await run(user.id, {
      status: isDisabled ? 'active' : 'disabled',
    })
    if (updated) {
      onUpdated(updated)
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={isLoading}
      onClick={handleClick}
      className="px-[2.8px] text-accent hover:bg-accent/10 hover:text-accent active:bg-accent/18"
    >
      {isDisabled ? (
        <RotateCcw className="size-3.5" />
      ) : (
        <Ban className="size-3.5" />
      )}
      {isDisabled
        ? messages.adminUsers.enableButton
        : messages.adminUsers.disableButton}
    </Button>
  )
}
