'use server'

import { revalidatePath } from 'next/cache'
import { fetchData } from '../FetchData'
import { messages } from '@/constants/messages'
import type { ApiActionResult } from '@/hooks/useApiAction'
import type { ProjectListItem } from '@/types/Project'

/**
 * 案件作成API（選択したテンプレートを参照する状態で、7工程分のレコードを一括作成する）
 * @param name - 案件名
 * @param templateId - 参照するテンプレートID
 * @returns 作成された案件。エラー時は`error`を含む結果
 */
export const createProject = async (
  name: string,
  templateId: string
): Promise<ApiActionResult<ProjectListItem>> => {
  const response = await fetchData('/projects', undefined, {
    method: 'POST',
    body: { name, templateId },
  })

  if (response.error) {
    return { ok: false, error: response.error.messages }
  }

  revalidatePath('/projects')
  return {
    ok: true,
    data: response,
    message: messages.projects.toastMessage.successCreate,
  }
}
