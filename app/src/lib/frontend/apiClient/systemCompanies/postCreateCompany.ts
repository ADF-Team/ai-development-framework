'use server'

import { revalidatePath } from 'next/cache'
import { fetchData } from '../FetchData'
import { messages } from '@/constants/messages'
import type { ApiActionResult } from '@/hooks/useApiAction'
import type { CreateCompanyInput } from '@/schemas/createCompanySchema'
import type { CompanyListItem } from '@/types/Company'

/**
 * 会社作成API
 * @param payload - 会社名・初期管理者のメールアドレス・表示名
 * @returns 作成された会社。エラー時は`error`を含む結果
 */
export const postCreateCompany = async (
  payload: CreateCompanyInput
): Promise<ApiActionResult<CompanyListItem>> => {
  const response = await fetchData('/system/companies', undefined, {
    method: 'POST',
    body: payload,
  })

  if (response.error) {
    return { ok: false, error: response.error.messages }
  }

  revalidatePath('/system/companies')
  return {
    ok: true,
    data: response as CompanyListItem,
    message: messages.companyManagement.toastMessage.successCreate,
  }
}
