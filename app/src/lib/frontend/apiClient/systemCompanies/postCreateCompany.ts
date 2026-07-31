'use server'

import { revalidatePath } from 'next/cache'
import { fetchData } from '../FetchData'
import { messages } from '@/constants/messages'
import { showSuccessToast, showErrorToast } from '@/utils/toast'
import type { CreateCompanyInput } from '@/schemas/createCompanySchema'
import type { CompanyListItem } from '@/types/Company'

/**
 * 会社作成API
 * @param payload - 会社名・初期管理者のメールアドレス・表示名
 * @returns 作成された会社。エラー時はnull
 */
export const postCreateCompany = async (
  payload: CreateCompanyInput
): Promise<CompanyListItem | null> => {
  const response = await fetchData('/system/companies', undefined, {
    method: 'POST',
    body: payload,
  })

  if (response.error) {
    showErrorToast(response.error.messages)
    return null
  }

  revalidatePath('/system/companies')
  showSuccessToast(messages.companyManagement.toastMessage.successCreate)
  return response as CompanyListItem
}
