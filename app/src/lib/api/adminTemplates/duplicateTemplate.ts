'use server'

import { revalidatePath } from 'next/cache'
import { fetchData } from '../FetchData'
import { messages } from '@/constants/messages'
import { showSuccessToast, showErrorToast } from '@/utils/toast'

/**
 * テンプレート複製API（現在有効な版の内容をコピーした新規テンプレートを作成する）
 * @param templateId - 複製元のテンプレートID
 * @returns 作成された複製テンプレートのID。エラー時はnull
 */
export const duplicateTemplate = async (
  templateId: string
): Promise<string | null> => {
  const response = await fetchData(
    `/admin/templates/${templateId}/duplicate`,
    undefined,
    { method: 'POST' }
  )

  if (response.error) {
    showErrorToast(response.error.messages)
    return null
  }

  revalidatePath('/admin/templates')
  showSuccessToast(messages.adminTemplates.toastMessage.successDuplicate)
  return response.id
}
