import { requireRole } from './requireRole'

/**
 * ログイン済みかつadmin/system_adminロールのユーザーを取得する
 * 条件を満たさない場合はServiceErrorを投げる（呼び出し元でhandleServiceErrorに変換する）
 */
export function requireAdmin() {
  return requireRole(['admin', 'system_admin'])
}
