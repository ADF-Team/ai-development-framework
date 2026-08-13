import { requireRole } from './requireRole'

/**
 * ログイン済みかつsystem_adminロールのユーザーを取得する
 * 条件を満たさない場合はServiceErrorを投げる（呼び出し元でhandleServiceErrorに変換する）
 */
export function requireSystemAdmin() {
  return requireRole(['system_admin'])
}
