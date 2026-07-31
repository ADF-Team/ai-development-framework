import { notFound } from 'next/navigation'
import { isStageKey } from '@/types/Project'
import { getPublishedTemplateDetail } from '@/lib/frontend/apiClient/publishedTemplates/getPublishedTemplateDetail'
import { PublishedTemplateDetailScreen } from '@/features/published-templates/components/PublishedTemplateDetailScreen'
import type { UserRole } from '@/types/User'

// TODO: getCurrentUser()実装後、実際のログインユーザーのロールに置き換える
function getCurrentUserRole(): UserRole {
  return 'admin'
}

// 公開テンプレート詳細画面（/templates/published/[templateId]/[stageKey]）
export default async function PublishedTemplateStagePage({
  params,
}: {
  params: Promise<{ templateId: string; stageKey: string }>
}) {
  const { templateId, stageKey } = await params
  if (!isStageKey(stageKey)) {
    notFound()
  }

  const template = await getPublishedTemplateDetail(templateId)
  if ('error' in template) {
    notFound()
  }

  const role = getCurrentUserRole()
  const isAdmin = role === 'admin' || role === 'system_admin'

  return (
    <PublishedTemplateDetailScreen
      key={stageKey}
      template={template}
      stageKey={stageKey}
      isAdmin={isAdmin}
    />
  )
}
