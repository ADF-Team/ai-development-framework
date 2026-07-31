import { getPublishedTemplateList } from '@/lib/frontend/apiClient/publishedTemplates/getPublishedTemplateList'
import { PublishedTemplateListScreen } from '@/features/published-templates/components/PublishedTemplateListScreen'

// 公開テンプレート一覧画面（/templates/published）
export default async function PublishedTemplatesPage() {
  const response = await getPublishedTemplateList()
  const templates = 'templates' in response ? response.templates : []

  return <PublishedTemplateListScreen templates={templates} />
}
