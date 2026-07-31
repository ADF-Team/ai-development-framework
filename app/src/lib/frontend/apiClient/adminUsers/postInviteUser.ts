'use server'

import { revalidatePath } from 'next/cache'
import { fetchData } from '../FetchData'
import { messages } from '@/constants/messages'
import { showSuccessToast, showErrorToast } from '@/utils/toast'
import type { UserListItem, UserRole } from '@/types/User'

/**
 * メンバー招待API
 * @param email - 招待するメールアドレス
 * @param role - 招待するロール
 * @param displayName - 表示名
 * @returns 作成されたユーザー。エラー時はnull
 */
export const postInviteUser = async (
  email: string,
  role: UserRole,
  displayName: string
): Promise<UserListItem | null> => {
  const response = await fetchData('/admin/users', undefined, {
    method: 'POST',
    body: { email, role, displayName },
  })

  if (response.error) {
    showErrorToast(response.error.messages)
    return null
  }

  revalidatePath('/admin/users')
  showSuccessToast(messages.adminUsers.toastMessage.successInvite)
  return response as UserListItem
}
