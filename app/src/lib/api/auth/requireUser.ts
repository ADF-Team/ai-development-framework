import { requireRole } from './requireRole'

/**
 * ログイン済みのユーザーを取得する（ロールは問わない）
 * 条件を満たさない場合はServiceErrorを投げる（呼び出し元でhandleServiceErrorに変換する）
 */
export function requireUser() {
  return requireRole(['user', 'admin', 'system_admin'])
}
