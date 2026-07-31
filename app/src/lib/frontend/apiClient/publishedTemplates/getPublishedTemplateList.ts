'use server'

import { fetchData } from '../FetchData'
import type { PublishedTemplateSummary } from '@/types/PublishedTemplate'

/**
 * 公開テンプレート一覧取得API
 * @returns 公開テンプレート概要一覧。エラー時はerrorプロパティを含む
 */
export const getPublishedTemplateList = async () => {
  const response = await fetchData('/templates/published')
  return response as
    | { templates: PublishedTemplateSummary[]; error?: never }
    | { error: { status: number; messages: string; errorText: string } }
}
