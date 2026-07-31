'use server'

import { fetchData } from '../FetchData'
import type { CompanyListItem } from '@/types/Company'

/**
 * 会社（組織）一覧取得API
 * @returns 会社一覧。エラー時はerrorプロパティを含む
 */
export const getCompanyList = async () => {
  const response = await fetchData('/system/companies')
  return response as
    | { companies: CompanyListItem[]; error?: never }
    | { error: { status: number; messages: string; errorText: string } }
}
