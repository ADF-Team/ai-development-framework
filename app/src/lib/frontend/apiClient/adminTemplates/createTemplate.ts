'use server'

import { revalidatePath } from 'next/cache'
import { fetchData } from '../FetchData'
import { messages } from '@/constants/messages'
import type { ApiActionResult } from '@/hooks/useApiAction'

/**
 * テンプレート新規作成API（7工程分の空の内容で初期化される）
 * @param title - 作成するテンプレートの名前
 * @returns 作成されたテンプレートのID。エラー時は`error`を含む結果
 */
export const createTemplate = async (
  title: string
): Promise<ApiActionResult<string>> => {
  const response = await fetchData('/admin/templates', undefined, {
    method: 'POST',
    body: { title },
  })

  if (response.error) {
    return { ok: false, error: response.error.messages }
  }

  revalidatePath('/admin/templates')
  return {
    ok: true,
    data: response.id,
    message: messages.adminTemplates.toastMessage.successCreate,
  }
}
