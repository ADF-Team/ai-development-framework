'use server'

import { revalidatePath } from 'next/cache'
import { fetchData } from '../FetchData'
import { messages } from '@/constants/messages'
import { showSuccessToast, showErrorToast } from '@/utils/toast'

/**
 * テンプレート非公開API
 * @param templateId - 非公開に戻すテンプレートのID
 * @returns 成功時true。エラー時はnull
 */
export const postUnpublishTemplate = async (
  templateId: string
): Promise<true | null> => {
  const response = await fetchData(
    `/admin/templates/${templateId}/unpublish`,
    undefined,
    { method: 'POST' }
  )

  if (response.error) {
    showErrorToast(response.error.messages)
    return null
  }

  revalidatePath('/admin/templates')
  revalidatePath('/templates/published')
  showSuccessToast(messages.adminTemplates.toastMessage.successUnpublish)
  return true
}
