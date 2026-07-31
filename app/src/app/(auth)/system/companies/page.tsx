import { getCompanyList } from '@/lib/frontend/apiClient/systemCompanies/getCompanyList'
import { CompanyManagementScreen } from '@/features/system-companies/components/CompanyManagementScreen'

// 会社管理画面（/system/companies）
export default async function SystemCompaniesPage() {
  const response = await getCompanyList()
  const companies = 'companies' in response ? response.companies : []

  return <CompanyManagementScreen companies={companies} />
}
