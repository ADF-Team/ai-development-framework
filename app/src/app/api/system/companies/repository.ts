import {
  listCompanies,
  createCompany,
  updateCompany,
} from '@/lib/services/companies'
import type { CompanyStatus } from '@/types/Company'

// TODO: インフラ（Cloud SQL）準備後、Prisma経由でDBアクセスする実装に置き換える（現状はlib/services/companiesのモックストアを参照する）

// 会社（組織）一覧を取得する
export function findCompanies() {
  return listCompanies()
}

// 会社を作成する
export function insertCompany(payload: {
  companyName: string
  adminEmail: string
  adminDisplayName: string
}) {
  return createCompany(payload)
}

// 会社名の変更、または有効化／無効化を保存する
export function saveCompany(
  id: string,
  payload: { name?: string; status?: CompanyStatus }
) {
  return updateCompany(id, payload)
}
