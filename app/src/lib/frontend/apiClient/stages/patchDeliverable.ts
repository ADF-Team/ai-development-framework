'use server'

import { revalidatePath } from 'next/cache'
import { fetchData } from '../FetchData'
import { messages } from '@/constants/messages'
import type { ApiActionResult } from '@/hooks/useApiAction'
import type { GenerationMethod } from '@/types/Deliverable'

/**
 * 成果物保存API（プロンプトのみモードでの貼り付け・既存成果物の編集の両方に使用）
 * @param projectId - 案件ID
 * @param stageKey - 工程キー
 * @param content - 保存する成果物本文
 * @returns 保存後の成果物情報。エラー時は`error`を含む結果
 */
export const patchDeliverable = async (
  projectId: string,
  stageKey: string,
  content: string
): Promise<
  ApiActionResult<{
    deliverableId: string
    version: number
    generationMethod: GenerationMethod
  }>
> => {
  const response = await fetchData(
    `/projects/${projectId}/stages/${stageKey}/deliverable`,
    undefined,
    { method: 'PATCH', body: { content } }
  )

  if (response.error) {
    return { ok: false, error: response.error.messages }
  }

  revalidatePath(`/projects/${projectId}`)
  return {
    ok: true,
    data: response,
    message: messages.stages.toastMessage.successDeliverableSave,
  }
}
