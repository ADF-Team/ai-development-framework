import { getCurrentUser } from './getCurrentUser'
import { ServiceError } from '@/lib/services/ServiceError'
import { ERROR_STATUS } from '@/constants/response'
import { messages } from '@/constants/messages'

/**
 * ログイン済みかつsystem_adminロールのユーザーを取得する
 * 条件を満たさない場合はServiceErrorを投げる（呼び出し元でhandleServiceErrorに変換する）
 */
export async function requireSystemAdmin() {
  const user = await getCurrentUser()
  if (!user) {
    throw new ServiceError(
      ERROR_STATUS.UNAUTHORIZED,
      messages.common.errorMessage.unauthorized
    )
  }
  if (user.role !== 'system_admin') {
    throw new ServiceError(
      ERROR_STATUS.FORBIDDEN,
      messages.common.errorMessage.forbidden
    )
  }
  return user
}
