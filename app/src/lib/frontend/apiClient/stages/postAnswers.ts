'use server'

import { revalidatePath } from 'next/cache'
import { fetchData } from '../FetchData'
import { messages } from '@/constants/messages'
import type { ApiActionResult } from '@/hooks/useApiAction'
import type { StageStatus } from '@/types/Project'

/**
 * 工程の質問への回答保存API
 * @param projectId - 案件ID
 * @param stageKey - 工程キー
 * @param answers - 質問ID→回答のマップ
 * @returns 保存後の工程ステータス。エラー時は`error`を含む結果
 */
export const postAnswers = async (
  projectId: string,
  stageKey: string,
  answers: Record<string, string>
): Promise<
  ApiActionResult<{ projectStageId: string; status: StageStatus }>
> => {
  const response = await fetchData(
    `/projects/${projectId}/stages/${stageKey}/answers`,
    undefined,
    { method: 'POST', body: { answers } }
  )

  if (response.error) {
    return { ok: false, error: response.error.messages }
  }

  revalidatePath(`/projects/${projectId}`)
  return {
    ok: true,
    data: response,
    message: messages.stages.toastMessage.successAnswerSave,
  }
}
