'use server'

import { revalidatePath } from 'next/cache'
import { fetchData } from '../FetchData'
import { messages } from '@/constants/messages'
import { showSuccessToast, showErrorToast } from '@/utils/toast'
import type { StageStatus } from '@/types/Project'

/**
 * 工程の質問への回答保存API
 * @param projectId - 案件ID
 * @param stageKey - 工程キー
 * @param answers - 質問ID→回答のマップ
 * @returns 保存後の工程ステータス。エラー時はnull
 */
export const postAnswers = async (
  projectId: string,
  stageKey: string,
  answers: Record<string, string>
): Promise<{ projectStageId: string; status: StageStatus } | null> => {
  const response = await fetchData(
    `/projects/${projectId}/stages/${stageKey}/answers`,
    undefined,
    { method: 'POST', body: { answers } }
  )

  if (response.error) {
    showErrorToast(response.error.messages)
    return null
  }

  revalidatePath(`/projects/${projectId}`)
  showSuccessToast(messages.stages.toastMessage.successAnswerSave)
  return response
}
