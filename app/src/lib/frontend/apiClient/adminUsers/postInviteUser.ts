'use server'

import { revalidatePath } from 'next/cache'
import { fetchData } from '../FetchData'
import { messages } from '@/constants/messages'
import type { ApiActionResult } from '@/hooks/useApiAction'
import type { UserListItem, UserRole } from '@/types/User'

/**
 * メンバー招待API
 * @param email - 招待するメールアドレス
 * @param role - 招待するロール
 * @param displayName - 表示名
 * @returns 作成されたユーザー。エラー時は`error`を含む結果
 */
export const postInviteUser = async (
  email: string,
  role: UserRole,
  displayName: string
): Promise<ApiActionResult<UserListItem>> => {
  const response = await fetchData('/admin/users', undefined, {
    method: 'POST',
    body: { email, role, displayName },
  })

  if (response.error) {
    return { ok: false, error: response.error.messages }
  }

  revalidatePath('/admin/users')
  return {
    ok: true,
    data: response as UserListItem,
    message: messages.adminUsers.toastMessage.successInvite,
  }
}
