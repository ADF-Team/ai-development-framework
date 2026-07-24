'use server'

import { fetchData } from '../FetchData'
import type { StageTemplateDetail } from '@/types/StageTemplate'

/**
 * テンプレート取得API（管理者用。テンプレート名・質問セット・プロンプトテンプレート・品質ゲート項目・バージョン履歴）
 * @param templateId - テンプレートID
 * @param stageKey - 工程キー
 * @returns テンプレートデータ。エラー時はerrorプロパティを含む
 */
export const getStageTemplate = async (templateId: string, stageKey: string) => {
  const response = await fetchData(
    `/admin/templates/${templateId}/stages/${stageKey}`
  )
  return response as
    | (StageTemplateDetail & { error?: never })
    | { error: { status: number; messages: string; errorText: string } }
}
