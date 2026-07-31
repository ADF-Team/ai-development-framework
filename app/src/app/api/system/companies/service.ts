import * as repository from './repository'
import type { CreateCompanyInput } from '@/schemas/createCompanySchema'
import type { CompanyStatus } from '@/types/Company'

// 会社一覧を取得する
export function getCompanyList() {
  return repository.findCompanies()
}

// 会社を作成し、初期管理者を招待する
export function registerCompany(input: CreateCompanyInput) {
  return repository.insertCompany(input)
}

// 会社名の変更、または有効化／無効化を行う
export function updateCompanyDetail(
  id: string,
  payload: { name?: string; status?: CompanyStatus }
) {
  return repository.saveCompany(id, payload)
}
