export type CompanyStatus = 'active' | 'suspended'

export interface CompanyListItem {
  id: string
  name: string
  status: CompanyStatus
  createdAt: string
}
