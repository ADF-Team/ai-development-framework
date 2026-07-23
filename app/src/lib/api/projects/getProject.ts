'use server'

import { fetchData } from '../FetchData'
import type { ProjectDetail } from '@/types/Project'

/**
 * 案件詳細取得API
 * @param id - 案件ID
 * @returns 案件詳細（工程別ステータス一覧含む）。エラー時はerrorプロパティを含む
 */
export const getProject = async (id: string) => {
  const response = await fetchData(`/projects/${id}`)
  return response as
    | (ProjectDetail & { error?: never })
    | { error: { status: number; messages: string; errorText: string } }
}
