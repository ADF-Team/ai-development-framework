import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tag } from '@/components/tag/Tag'
import { messages } from '@/constants/messages'
import { RoleSelect } from './RoleSelect'
import { DisableUserButton } from './DisableUserButton'
import type { UserListItem } from '@/types/User'

const STATUS_TAG_CLASS: Record<UserListItem['status'], string> = {
  active: 'bg-neutral-800 text-neutral-100',
  disabled: 'border border-accent text-accent',
}

// ユーザー管理画面：メンバー一覧テーブル（ロール・ステータス表示、ロール変更・無効化操作を行う）
export function UserListTable({
  users,
  onUpdated,
}: {
  users: UserListItem[]
  onUpdated: (user: UserListItem) => void
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{messages.adminUsers.table.nameHeader}</TableHead>
          <TableHead>{messages.adminUsers.table.emailHeader}</TableHead>
          <TableHead>{messages.adminUsers.table.roleHeader}</TableHead>
          <TableHead>{messages.adminUsers.table.statusHeader}</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.displayName}</TableCell>
            <TableCell className="text-text/55">{user.email}</TableCell>
            <TableCell>
              <RoleSelect user={user} onUpdated={onUpdated} />
            </TableCell>
            <TableCell>
              <Tag className={STATUS_TAG_CLASS[user.status]}>
                {messages.adminUsers.statusLabel[user.status]}
              </Tag>
            </TableCell>
            <TableCell>
              <DisableUserButton user={user} onUpdated={onUpdated} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
