'use server'

import { revalidatePath } from 'next/cache'
import { fetchData } from '../FetchData'
import { messages } from '@/constants/messages'
import { showSuccessToast, showErrorToast } from '@/utils/toast'
import type { ProjectListItem } from '@/types/Project'

/**
 * 案件作成API（選択したテンプレートを参照する状態で、7工程分のレコードを一括作成する）
 * @param name - 案件名
 * @param templateId - 参照するテンプレートID
 * @returns 作成された案件。エラー時はnull
 */
export const createProject = async (
  name: string,
  templateId: string
): Promise<ProjectListItem | null> => {
  const response = await fetchData('/projects', undefined, {
    method: 'POST',
    body: { name, templateId },
  })

  if (response.error) {
    showErrorToast(response.error.messages)
    return null
  }

  revalidatePath('/projects')
  showSuccessToast(messages.projects.toastMessage.successCreate)
  return response
}
