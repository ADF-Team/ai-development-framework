// Organization.status（Prisma OrganizationStatus enum）と対応する値。両者の値は手動で同期させる
export const COMPANY_STATUS_VALUES = ['active', 'suspended'] as const

export type CompanyStatus = (typeof COMPANY_STATUS_VALUES)[number]

export interface CompanyListItem {
  id: string
  name: string
  status: CompanyStatus
  createdAt: string
}
