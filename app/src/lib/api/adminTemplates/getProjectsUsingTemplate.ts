'use server'

import { fetchData } from '../FetchData'

/**
 * テンプレート編集時の影響確認用：このテンプレートを参照している進行中の案件一覧取得API
 * @param templateId - テンプレートID
 * @returns 進行中の案件一覧（id・name）。エラー時はerrorプロパティを含む
 */
export const getProjectsUsingTemplate = async (templateId: string) => {
  const response = await fetchData(`/admin/templates/${templateId}/projects`)
  return response as
    | { projects: { id: string; name: string }[]; error?: never }
    | { error: { status: number; messages: string; errorText: string } }
}
