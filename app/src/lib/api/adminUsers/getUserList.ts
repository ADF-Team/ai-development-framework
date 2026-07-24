'use server'

import { fetchData } from '../FetchData'
import type { UserListItem } from '@/types/User'

/**
 * 組織内メンバー一覧取得API
 * @returns メンバー一覧。エラー時はerrorプロパティを含む
 */
export const getUserList = async () => {
  const response = await fetchData('/admin/users')
  return response as
    | { users: UserListItem[]; error?: never }
    | { error: { status: number; messages: string; errorText: string } }
}
