'use server'

import { revalidatePath } from 'next/cache'
import { fetchData } from '../FetchData'
import { messages } from '@/constants/messages'
import { showSuccessToast, showErrorToast } from '@/utils/toast'
import type { GenerationMethod } from '@/types/Deliverable'

/**
 * 工程のAI実行API（アプリ内実行モード時のみ呼び出す）
 * @param projectId - 案件ID
 * @param stageKey - 工程キー
 * @returns 生成された成果物データ。エラー時はnull
 */
export const postExecuteStage = async (
  projectId: string,
  stageKey: string
): Promise<{
  deliverableId: string
  version: number
  content: string
  generationMethod: GenerationMethod
  tokensUsed: { input: number; output: number }
} | null> => {
  const response = await fetchData(
    `/projects/${projectId}/stages/${stageKey}/execute`,
    undefined,
    { method: 'POST' }
  )

  if (response.error) {
    showErrorToast(response.error.messages)
    return null
  }

  revalidatePath(`/projects/${projectId}`)
  showSuccessToast(messages.stages.toastMessage.successExecute)
  return response
}
