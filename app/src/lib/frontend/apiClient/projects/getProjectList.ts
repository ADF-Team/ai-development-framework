'use server'

import { fetchData } from '../FetchData'
import type { ProjectListItem } from '@/types/Project'

/**
 * 案件一覧取得API
 * @returns 案件一覧（7工程分のステータスサマリー付き）。エラー時はerrorプロパティを含む
 */
export const getProjectList = async () => {
  const response = await fetchData('/projects')
  return response as
    | { projects: ProjectListItem[]; error?: never }
    | { error: { status: number; messages: string; errorText: string } }
}
