'use server'

import { revalidatePath } from 'next/cache'
import { fetchData } from '../FetchData'
import { messages } from '@/constants/messages'
import type { ApiActionResult } from '@/hooks/useApiAction'
import type { CompanyListItem, CompanyStatus } from '@/types/Company'

/**
 * 会社名の変更・有効化／無効化API
 * @param id - 対象の会社ID
 * @param payload - 変更後の会社名またはステータス
 * @returns 更新後の会社。エラー時は`error`を含む結果
 */
export const patchCompany = async (
  id: string,
  payload: { name?: string; status?: CompanyStatus }
): Promise<ApiActionResult<CompanyListItem>> => {
  const response = await fetchData(`/system/companies/${id}`, undefined, {
    method: 'PATCH',
    body: payload,
  })

  if (response.error) {
    return { ok: false, error: response.error.messages }
  }

  revalidatePath('/system/companies')
  return {
    ok: true,
    data: response as CompanyListItem,
    message: messages.companyManagement.toastMessage.successUpdate,
  }
}
