import { getUserList } from '@/lib/api/adminUsers/getUserList'
import { UserManagementScreen } from '@/features/admin-users/components/UserManagementScreen'

// ユーザー管理画面（/admin/users）
export default async function AdminUsersPage() {
  const response = await getUserList()
  const users = 'users' in response ? response.users : []

  return <UserManagementScreen users={users} />
}
