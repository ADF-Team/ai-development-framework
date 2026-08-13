'use server'

import { revalidatePath } from 'next/cache'
import { fetchData } from '../FetchData'
import { messages } from '@/constants/messages'
import type { ApiActionResult } from '@/hooks/useApiAction'
import type { GenerationMethod } from '@/types/Deliverable'

/**
 * 工程のAI実行API（アプリ内実行モード時のみ呼び出す）
 * @param projectId - 案件ID
 * @param stageKey - 工程キー
 * @returns 生成された成果物データ。エラー時は`error`を含む結果
 */
export const postExecuteStage = async (
  projectId: string,
  stageKey: string
): Promise<
  ApiActionResult<{
    deliverableId: string
    version: number
    content: string
    generationMethod: GenerationMethod
    tokensUsed: { input: number; output: number }
  }>
> => {
  const response = await fetchData(
    `/projects/${projectId}/stages/${stageKey}/execute`,
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
    message: messages.stages.toastMessage.successExecute,
  }
}
