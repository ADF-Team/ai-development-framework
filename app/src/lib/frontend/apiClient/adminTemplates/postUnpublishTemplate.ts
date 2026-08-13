'use server'

import { revalidatePath } from 'next/cache'
import { fetchData } from '../FetchData'
import { messages } from '@/constants/messages'
import type { ApiActionResult } from '@/hooks/useApiAction'

/**
 * テンプレート非公開API
 * @param templateId - 非公開に戻すテンプレートのID
 * @returns 成功時true。エラー時は`error`を含む結果
 */
export const postUnpublishTemplate = async (
  templateId: string
): Promise<ApiActionResult<true>> => {
  const response = await fetchData(
    `/admin/templates/${templateId}/unpublish`,
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
    data: true,
    message: messages.adminTemplates.toastMessage.successUnpublish,
  }
}
