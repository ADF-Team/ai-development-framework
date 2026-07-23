'use server'

import { revalidatePath } from 'next/cache'
import { fetchData } from '../FetchData'
import { messages } from '@/constants/messages'
import { showSuccessToast, showErrorToast } from '@/utils/toast'
import type { StageKey } from '@/types/Project'

/**
 * 品質ゲート判定API（チェック結果を保存し、通過時は次工程へ移行する）
 * @param projectId - 案件ID
 * @param stageKey - 工程キー
 * @param checkedItemIds - チェック済みの品質ゲート項目ID一覧
 * @returns 通過判定結果。エラー時はnull
 */
export const postQualityGate = async (
  projectId: string,
  stageKey: string,
  checkedItemIds: string[]
): Promise<
  | { passed: true; nextStage: StageKey | null; projectCompleted: boolean }
  | { passed: false; missingItemIds: string[] }
  | null
> => {
  const response = await fetchData(
    `/projects/${projectId}/stages/${stageKey}/quality-gate`,
    undefined,
    { method: 'POST', body: { checkedItemIds } }
  )

  if (response.error) {
    showErrorToast(response.error.messages)
    return null
  }

  revalidatePath(`/projects/${projectId}`)
  if (response.passed) {
    showSuccessToast(
      response.projectCompleted
        ? messages.stages.toastMessage.successProjectCompleted
        : messages.stages.toastMessage.successQualityGatePass
    )
  } else {
    showErrorToast(messages.stages.toastMessage.qualityGateMissingItems)
  }
  return response
}
