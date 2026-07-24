'use server'

import { revalidatePath } from 'next/cache'
import { fetchData } from '../FetchData'
import { messages } from '@/constants/messages'
import { showSuccessToast, showErrorToast } from '@/utils/toast'
import type { StageTemplateData } from '@/types/StageTemplate'

/**
 * テンプレート更新API（テンプレート名・質問セット・プロンプト・品質ゲート項目を新バージョンとして保存）
 * @param templateId - テンプレートID
 * @param stageKey - 工程キー
 * @param payload - 更新後のテンプレート内容
 * @returns 更新後のバージョン番号。エラー時はnull
 */
export const putStageTemplate = async (
  templateId: string,
  stageKey: string,
  payload: Omit<StageTemplateData, 'version'>
): Promise<number | null> => {
  const response = await fetchData(
    `/admin/templates/${templateId}/stages/${stageKey}`,
    undefined,
    { method: 'PUT', body: payload }
  )

  if (response.error) {
    showErrorToast(response.error.messages)
    return null
  }

  revalidatePath(`/admin/templates/${templateId}/${stageKey}`)
  showSuccessToast(messages.adminTemplates.toastMessage.successUpdate)
  return response.version
}
