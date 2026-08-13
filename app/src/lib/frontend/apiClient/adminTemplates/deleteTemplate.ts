'use server'

import { revalidatePath } from 'next/cache'
import { fetchData } from '../FetchData'
import { messages } from '@/constants/messages'
import type { ApiActionResult } from '@/hooks/useApiAction'

/**
 * テンプレート削除API（バージョン履歴・7工程分の内容も含めて完全に削除する）
 * @param templateId - 削除するテンプレートのID
 * @returns 成功時true。エラー時は`error`を含む結果
 */
export const deleteTemplate = async (
  templateId: string
): Promise<ApiActionResult<true>> => {
  const response = await fetchData(
    `/admin/templates/${templateId}`,
    undefined,
    { method: 'DELETE' }
  )

  if (response.error) {
    return { ok: false, error: response.error.messages }
  }

  revalidatePath('/admin/templates')
  return {
    ok: true,
    data: true,
    message: messages.adminTemplates.toastMessage.successDelete,
  }
}
