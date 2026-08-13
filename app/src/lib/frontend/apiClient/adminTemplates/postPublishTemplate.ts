'use server'

import { revalidatePath } from 'next/cache'
import { fetchData } from '../FetchData'
import { messages } from '@/constants/messages'
import type { ApiActionResult } from '@/hooks/useApiAction'

/**
 * テンプレート公開API
 * @param templateId - 公開するテンプレートのID
 * @returns 公開日時。エラー時は`error`を含む結果
 */
export const postPublishTemplate = async (
  templateId: string
): Promise<ApiActionResult<string>> => {
  const response = await fetchData(
    `/admin/templates/${templateId}/publish`,
    undefined,
    { method: 'POST' }
  )

  if (response.error) {
    return { ok: false, error: response.error.messages }
  }

  revalidatePath('/admin/templates')
  revalidatePath('/templates/published')
  return {
    ok: true,
    data: response.publishedAt,
    message: messages.adminTemplates.toastMessage.successPublish,
  }
}
