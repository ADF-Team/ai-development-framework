import { getStageTemplateList } from '@/lib/frontend/apiClient/adminTemplates/getStageTemplateList'
import { MyTemplateListScreen } from '@/features/admin-templates/components/MyTemplateListScreen'

// マイテンプレート一覧画面（/admin/templates）
export default async function AdminTemplatesPage() {
  const response = await getStageTemplateList()
  const templates = 'templates' in response ? response.templates : []

  return <MyTemplateListScreen templates={templates} />
}
