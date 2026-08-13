'use server'

import { revalidatePath } from 'next/cache'
import { fetchData } from '../FetchData'
import { messages } from '@/constants/messages'
import type { ApiActionResult } from '@/hooks/useApiAction'
import type { StageKey } from '@/types/Project'

type QualityGateData =
  | { passed: true; nextStage: StageKey | null; projectCompleted: boolean }
  | { passed: false; missingItemIds: string[] }

/**
 * 品質ゲート判定API（チェック結果を保存し、通過時は次工程へ移行する）
 * @param projectId - 案件ID
 * @param stageKey - 工程キー
 * @param checkedItemIds - チェック済みの品質ゲート項目ID一覧
 * @returns 通過判定結果。エラー時は`error`を含む結果
 */
export const postQualityGate = async (
  projectId: string,
  stageKey: string,
  checkedItemIds: string[]
): Promise<ApiActionResult<QualityGateData>> => {
  const response = await fetchData(
    `/projects/${projectId}/stages/${stageKey}/quality-gate`,
    undefined,
    { method: 'POST', body: { checkedItemIds } }
  )

  if (response.error) {
    return { ok: false, error: response.error.messages }
  }

  revalidatePath(`/projects/${projectId}`)

  if (response.passed) {
    return {
      ok: true,
      data: response,
      message: response.projectCompleted
        ? messages.stages.toastMessage.successProjectCompleted
        : messages.stages.toastMessage.successQualityGatePass,
    }
  }

  return {
    ok: true,
    data: response,
    message: messages.stages.toastMessage.qualityGateMissingItems,
    toastType: 'error',
  }
}
