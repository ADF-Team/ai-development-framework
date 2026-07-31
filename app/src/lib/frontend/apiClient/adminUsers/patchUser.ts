'use server'

import { revalidatePath } from 'next/cache'
import { fetchData } from '../FetchData'
import { messages } from '@/constants/messages'
import { showSuccessToast, showErrorToast } from '@/utils/toast'
import type { UserListItem, UserRole, UserStatus } from '@/types/User'

/**
 * メンバーのロール変更・アカウント無効化／再有効化API
 * @param id - 対象ユーザーID
 * @param payload - 変更後のロールまたはステータス
 * @returns 更新後のユーザー。エラー時はnull
 */
export const patchUser = async (
  id: string,
  payload: { role?: UserRole; status?: UserStatus }
): Promise<UserListItem | null> => {
  const response = await fetchData(`/admin/users/${id}`, undefined, {
    method: 'PATCH',
    body: payload,
  })

  if (response.error) {
    showErrorToast(response.error.messages)
    return null
  }

  revalidatePath('/admin/users')
  showSuccessToast(messages.adminUsers.toastMessage.successUpdate)
  return response as UserListItem
}
