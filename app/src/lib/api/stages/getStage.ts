'use server'

import { fetchData } from '../FetchData'
import type { StageDetail } from '@/types/Stage'

/**
 * 工程詳細取得API（質問・回答・プロンプト・成果物・品質ゲート状況）
 * @param projectId - 案件ID
 * @param stageKey - 工程キー
 * @returns 工程詳細。エラー時はerrorプロパティを含む
 */
export const getStage = async (projectId: string, stageKey: string) => {
  const response = await fetchData(`/projects/${projectId}/stages/${stageKey}`)
  return response as
    | (StageDetail & { error?: never })
    | { error: { status: number; messages: string; errorText: string } }
}
