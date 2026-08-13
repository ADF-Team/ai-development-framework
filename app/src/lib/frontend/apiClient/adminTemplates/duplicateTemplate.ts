'use server'

import { revalidatePath } from 'next/cache'
import { fetchData } from '../FetchData'
import { messages } from '@/constants/messages'
import type { ApiActionResult } from '@/hooks/useApiAction'

/**
 * テンプレート複製API（現在有効な版の内容をコピーした新規テンプレートを作成する）
 * @param templateId - 複製元のテンプレートID
 * @returns 作成された複製テンプレートのID。エラー時は`error`を含む結果
 */
export const duplicateTemplate = async (
  templateId: string
): Promise<ApiActionResult<string>> => {
  const response = await fetchData(
    `/admin/templates/${templateId}/duplicate`,
    undefined,
    { method: 'POST' }
  )

  if (response.error) {
    return { ok: false, error: response.error.messages }
  }

  revalidatePath('/admin/templates')
  return {
    ok: true,
    data: response.id,
    message: messages.adminTemplates.toastMessage.successDuplicate,
  }
}
