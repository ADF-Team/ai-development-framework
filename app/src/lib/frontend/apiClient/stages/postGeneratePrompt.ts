'use server'

import { revalidatePath } from 'next/cache'
import { fetchData } from '../FetchData'
import { messages } from '@/constants/messages'
import type { ApiActionResult } from '@/hooks/useApiAction'

/**
 * プロンプト生成API（保存済みの回答をテンプレートに埋め込む）
 * @param projectId - 案件ID
 * @param stageKey - 工程キー
 * @returns 生成されたプロンプト。エラー時は`error`を含む結果
 */
export const postGeneratePrompt = async (
  projectId: string,
  stageKey: string
): Promise<ApiActionResult<{ generatedPrompt: string }>> => {
  const response = await fetchData(
    `/projects/${projectId}/stages/${stageKey}/generate-prompt`,
    undefined,
    { method: 'POST' }
  )

  if (response.error) {
    return { ok: false, error: response.error.messages }
  }

  revalidatePath(`/projects/${projectId}`)
  return {
    ok: true,
    data: response,
    message: messages.stages.toastMessage.successPromptGenerate,
  }
}
