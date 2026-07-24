import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { messages } from '@/constants/messages'
import { useApiAction } from '@/hooks/useApiAction'
import { patchUser } from '@/lib/api/adminUsers/patchUser'
import type { UserListItem, UserRole } from '@/types/User'

// ユーザー管理画面：メンバー一覧の1行分のロール変更セレクト
export function RoleSelect({
  user,
  onUpdated,
}: {
  user: UserListItem
  onUpdated: (user: UserListItem) => void
}) {
  const { run, isLoading } = useApiAction(patchUser)

  const handleChange = async (value: string) => {
    const role = value as UserRole
    if (role === user.role) return
    const updated = await run(user.id, { role })
    if (updated) {
      onUpdated(updated)
    }
  }

  return (
    <Select
      value={user.role}
      onValueChange={handleChange}
      disabled={isLoading || user.status === 'disabled'}
    >
      <SelectTrigger size="sm" className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="user">
          {messages.adminUsers.roleLabel.user}
        </SelectItem>
        <SelectItem value="admin">
          {messages.adminUsers.roleLabel.admin}
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
