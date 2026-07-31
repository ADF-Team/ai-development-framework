'use server'

import { fetchData } from '../FetchData'
import type { StageTemplateData } from '@/types/StageTemplate'

/**
 * テンプレートの特定バージョン・特定工程の内容取得API（バージョン履歴の差分表示用）
 * @param templateId - テンプレートID
 * @param stageKey - 工程キー
 * @param version - バージョン番号
 * @returns テンプレートデータ。エラー時はerrorプロパティを含む
 */
export const getStageTemplateVersion = async (
  templateId: string,
  stageKey: string,
  version: number
) => {
  const response = await fetchData(
    `/admin/templates/${templateId}/stages/${stageKey}/versions/${version}`
  )
  return response as
    | (StageTemplateData & { error?: never })
    | { error: { status: number; messages: string; errorText: string } }
}
