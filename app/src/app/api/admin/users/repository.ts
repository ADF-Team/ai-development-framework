import type { User } from '@prisma/client'
import { prisma } from '@/lib/api/prisma'
import {
  ServiceError,
  withPrismaErrorMapping,
} from '@/lib/services/ServiceError'
import { ERROR_STATUS } from '@/constants/response'
import { messages } from '@/constants/messages'
import type { UserListItem } from '@/types/User'

// PrismaのUserレコードを画面表示用のUserListItemに変換する
function toUserListItem(user: User): UserListItem {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName ?? '',
    role: user.role,
    status: user.status,
  }
}

// 組織内メンバー一覧を取得する
export async function findUsersByOrganization(
  organizationId: string
): Promise<UserListItem[]> {
  const users = await withPrismaErrorMapping(() =>
    prisma.user.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'asc' },
    })
  )
  return users.map(toUserListItem)
}

// 組織内メンバーを新規作成する（Identity Platform側のユーザー作成は別途行う）
export async function insertUser(payload: {
  organizationId: string
  identityPlatformUid: string
  email: string
  displayName: string
  role: 'user' | 'admin'
}): Promise<UserListItem> {
  const user = await withPrismaErrorMapping(() =>
    prisma.user.create({ data: payload })
  )
  return toUserListItem(user)
}

// 対象ユーザーが呼び出し元と同じ組織に属することを確認する（他組織のユーザーIDを指定された場合は404扱いにする）
async function findUserInOrganizationOrThrow(
  organizationId: string,
  id: string
): Promise<User> {
  const user = await withPrismaErrorMapping(() =>
    prisma.user.findFirst({ where: { id, organizationId } })
  )
  if (!user) {
    throw new ServiceError(
      ERROR_STATUS.NOT_FOUND,
      messages.common.errorMessage.notFound
    )
  }
  return user
}

// メンバーのロール変更、またはアカウントの無効化／再有効化を保存する
export async function saveUser(
  organizationId: string,
  id: string,
  payload: { role?: 'user' | 'admin'; status?: 'active' | 'disabled' }
): Promise<UserListItem> {
  await findUserInOrganizationOrThrow(organizationId, id)

  const updated = await withPrismaErrorMapping(() =>
    prisma.user.update({
      where: { id },
      data: {
        ...(payload.role ? { role: payload.role } : {}),
        ...(payload.status ? { status: payload.status } : {}),
      },
    })
  )
  return toUserListItem(updated)
}
