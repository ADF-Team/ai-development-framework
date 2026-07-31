'use server'

import { revalidatePath } from 'next/cache'
import { fetchData } from '../FetchData'
import { messages } from '@/constants/messages'
import { showSuccessToast, showErrorToast } from '@/utils/toast'

/**
 * テンプレート公開API
 * @param templateId - 公開するテンプレートのID
 * @returns 公開日時。エラー時はnull
 */
export const postPublishTemplate = async (
  templateId: string
): Promise<string | null> => {
  const response = await fetchData(
    `/admin/templates/${templateId}/publish`,
    undefined,
    { method: 'POST' }
  )

  if (response.error) {
    showErrorToast(response.error.messages)
    return null
  }

  revalidatePath('/admin/templates')
  revalidatePath('/templates/published')
  showSuccessToast(messages.adminTemplates.toastMessage.successPublish)
  return response.publishedAt
}
