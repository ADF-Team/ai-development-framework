'use server'

import { fetchData } from '../FetchData'
import type { TemplateSummary } from '@/types/StageTemplate'

/**
 * マイテンプレート一覧取得API（テンプレート概要一覧）
 * @returns テンプレート概要一覧。エラー時はerrorプロパティを含む
 */
export const getStageTemplateList = async () => {
  const response = await fetchData('/admin/templates')
  return response as
    | { templates: TemplateSummary[]; error?: never }
    | { error: { status: number; messages: string; errorText: string } }
}
