'use server'

import { fetchData } from '../FetchData'
import type { PublishedTemplateDetail } from '@/types/PublishedTemplate'

/**
 * 公開テンプレート詳細取得API
 * @param templateId - 公開テンプレートID
 * @returns 現在有効な版の7工程分の内容。エラー時はerrorプロパティを含む
 */
export const getPublishedTemplateDetail = async (templateId: string) => {
  const response = await fetchData(`/templates/published/${templateId}`)
  return response as
    | (PublishedTemplateDetail & { error?: never })
    | { error: { status: number; messages: string; errorText: string } }
}
