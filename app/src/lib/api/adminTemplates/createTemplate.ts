'use server'

import { revalidatePath } from 'next/cache'
import { fetchData } from '../FetchData'
import { messages } from '@/constants/messages'
import { showSuccessToast, showErrorToast } from '@/utils/toast'

/**
 * テンプレート新規作成API（7工程分の空の内容で初期化される）
 * @param title - 作成するテンプレートの名前
 * @returns 作成されたテンプレートのID。エラー時はnull
 */
export const createTemplate = async (title: string): Promise<string | null> => {
  const response = await fetchData('/admin/templates', undefined, {
    method: 'POST',
    body: { title },
  })

  if (response.error) {
    showErrorToast(response.error.messages)
    return null
  }

  revalidatePath('/admin/templates')
  showSuccessToast(messages.adminTemplates.toastMessage.successCreate)
  return response.id
}
