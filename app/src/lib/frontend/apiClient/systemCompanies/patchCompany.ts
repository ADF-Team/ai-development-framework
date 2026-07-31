'use server'

import { revalidatePath } from 'next/cache'
import { fetchData } from '../FetchData'
import { messages } from '@/constants/messages'
import { showSuccessToast, showErrorToast } from '@/utils/toast'
import type { CompanyListItem, CompanyStatus } from '@/types/Company'

/**
 * 会社名の変更・有効化／無効化API
 * @param id - 対象の会社ID
 * @param payload - 変更後の会社名またはステータス
 * @returns 更新後の会社。エラー時はnull
 */
export const patchCompany = async (
  id: string,
  payload: { name?: string; status?: CompanyStatus }
): Promise<CompanyListItem | null> => {
  const response = await fetchData(`/system/companies/${id}`, undefined, {
    method: 'PATCH',
    body: payload,
  })

  if (response.error) {
    showErrorToast(response.error.messages)
    return null
  }

  revalidatePath('/system/companies')
  showSuccessToast(messages.companyManagement.toastMessage.successUpdate)
  return response as CompanyListItem
}
