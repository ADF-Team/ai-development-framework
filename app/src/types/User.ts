export type UserRole = 'user' | 'admin'
export type UserStatus = 'active' | 'disabled'

export interface UserListItem {
  id: string
  email: string
  displayName: string
  role: UserRole
  status: UserStatus
}
