import { getCurrentUser } from './getCurrentUser'
import { ServiceError } from '@/lib/services/ServiceError'
import { ERROR_STATUS } from '@/constants/response'
import { messages } from '@/constants/messages'
import type { UserRole } from '@/types/User'

/**
 * ログイン済みかつ指定したロールのいずれかを持つユーザーを取得する
 * 条件を満たさない場合はServiceErrorを投げる（呼び出し元でhandleServiceErrorに変換する）
 * @param allowedRoles - アクセスを許可するロール一覧
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const user = await getCurrentUser()
  if (!user) {
    throw new ServiceError(
      ERROR_STATUS.UNAUTHORIZED,
      messages.common.errorMessage.unauthorized
    )
  }
  if (!allowedRoles.includes(user.role)) {
    throw new ServiceError(
      ERROR_STATUS.FORBIDDEN,
      messages.common.errorMessage.forbidden
    )
  }
  return user
}
