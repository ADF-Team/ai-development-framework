'use server'

import { revalidatePath } from 'next/cache'
import { fetchData } from '../FetchData'
import { messages } from '@/constants/messages'
import type { ApiActionResult } from '@/hooks/useApiAction'
import type { UserListItem, UserRole, UserStatus } from '@/types/User'

/**
 * メンバーのロール変更・アカウント無効化／再有効化API
 * @param id - 対象ユーザーID
 * @param payload - 変更後のロールまたはステータス
 * @returns 更新後のユーザー。エラー時は`error`を含む結果
 */
export const patchUser = async (
  id: string,
  payload: { role?: UserRole; status?: UserStatus }
): Promise<ApiActionResult<UserListItem>> => {
  const response = await fetchData(`/admin/users/${id}`, undefined, {
    method: 'PATCH',
    body: payload,
  })

  if (response.error) {
    return { ok: false, error: response.error.messages }
  }

  revalidatePath('/admin/users')
  return {
    ok: true,
    data: response as UserListItem,
    message: messages.adminUsers.toastMessage.successUpdate,
  }
}
