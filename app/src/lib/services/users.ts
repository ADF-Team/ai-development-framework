import { messages } from '@/constants/messages'
import { ServiceError } from './ServiceError'
import type { UserListItem, UserRole, UserStatus } from '@/types/User'

// TODO: インフラ（Cloud SQL）準備後、Prisma経由でDBアクセスする実装に置き換える。
// 現状はプロセス内メモリのモックストアで組織内メンバーを保持する。
const USERS = new Map<string, UserListItem>([
  [
    'u1',
    {
      id: 'u1',
      email: 'yamada@example.com',
      displayName: '山田 太郎',
      role: 'admin',
      status: 'active',
    },
  ],
  [
    'u2',
    {
      id: 'u2',
      email: 'tanaka@example.com',
      displayName: '田中 花子',
      role: 'user',
      status: 'active',
    },
  ],
  [
    'u3',
    {
      id: 'u3',
      email: 'suzuki@example.com',
      displayName: '鈴木 一郎',
      role: 'user',
      status: 'disabled',
    },
  ],
])

function findUserOrThrow(id: string): UserListItem {
  const user = USERS.get(id)
  if (!user) {
    throw new ServiceError(404, messages.common.errorMessage.notFound)
  }
  return user
}

/**
 * 組織内メンバー一覧を取得する（ユーザー管理画面用）
 */
export function listUsers(): UserListItem[] {
  return Array.from(USERS.values())
}

/**
 * 組織内メンバーを招待する（Identity Platform側のユーザー作成・招待メール送信は別途行う想定）
 * @param payload - 招待するメンバーのメールアドレス・ロール・表示名
 */
export function inviteUser(payload: {
  email: string
  role: UserRole
  displayName: string
}): UserListItem {
  const alreadyExists = Array.from(USERS.values()).some(
    (user) => user.email === payload.email
  )
  if (alreadyExists) {
    throw new ServiceError(409, messages.common.errorMessage.conflict)
  }

  const id = `u${Date.now()}`
  const user: UserListItem = {
    id,
    email: payload.email,
    displayName: payload.displayName,
    role: payload.role,
    status: 'active',
  }
  USERS.set(id, user)
  return user
}

/**
 * メンバーのロール変更、またはアカウントの無効化／再有効化を行う
 * @param id - 対象ユーザーID
 * @param payload - 変更後のロールまたはステータス
 */
export function updateUser(
  id: string,
  payload: { role?: UserRole; status?: UserStatus }
): UserListItem {
  const user = findUserOrThrow(id)
  const updated: UserListItem = {
    ...user,
    ...(payload.role ? { role: payload.role } : {}),
    ...(payload.status ? { status: payload.status } : {}),
  }
  USERS.set(id, updated)
  return updated
}
