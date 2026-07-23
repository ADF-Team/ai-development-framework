'use server'

import { revalidatePath } from 'next/cache'
import { fetchData } from '../FetchData'
import { messages } from '@/constants/messages'
import { showSuccessToast, showErrorToast } from '@/utils/toast'

/**
 * プロンプト生成API（保存済みの回答をテンプレートに埋め込む）
 * @param projectId - 案件ID
 * @param stageKey - 工程キー
 * @returns 生成されたプロンプト。エラー時はnull
 */
export const postGeneratePrompt = async (
  projectId: string,
  stageKey: string
): Promise<{ generatedPrompt: string } | null> => {
  const response = await fetchData(
    `/projects/${projectId}/stages/${stageKey}/generate-prompt`,
    undefined,
    { method: 'POST' }
  )

  if (response.error) {
    showErrorToast(response.error.messages)
    return null
  }

  revalidatePath(`/projects/${projectId}`)
  showSuccessToast(messages.stages.toastMessage.successPromptGenerate)
  return response
}
