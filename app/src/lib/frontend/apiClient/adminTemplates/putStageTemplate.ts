'use server'

import { revalidatePath } from 'next/cache'
import { fetchData } from '../FetchData'
import { messages } from '@/constants/messages'
import type { ApiActionResult } from '@/hooks/useApiAction'
import type { StageTemplateData } from '@/types/StageTemplate'

/**
 * テンプレート更新API（テンプレート名・質問セット・プロンプト・品質ゲート項目を新バージョンとして保存）
 * @param templateId - テンプレートID
 * @param stageKey - 工程キー
 * @param payload - 更新後のテンプレート内容
 * @returns 更新後のバージョン番号。エラー時は`error`を含む結果
 */
export const putStageTemplate = async (
  templateId: string,
  stageKey: string,
  payload: Omit<StageTemplateData, 'version'>
): Promise<ApiActionResult<number>> => {
  const response = await fetchData(
    `/admin/templates/${templateId}/stages/${stageKey}`,
    undefined,
    { method: 'PUT', body: payload }
  )

  if (response.error) {
    return { ok: false, error: response.error.messages }
  }

  revalidatePath(`/admin/templates/${templateId}/${stageKey}`)
  return {
    ok: true,
    data: response.version,
    message: messages.adminTemplates.toastMessage.successUpdate,
  }
}
