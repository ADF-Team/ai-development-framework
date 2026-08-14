import { notFound, redirect } from 'next/navigation'
import { isStageKey } from '@/types/Project'
import { getPublishedTemplateDetail } from '@/lib/frontend/apiClient/publishedTemplates/getPublishedTemplateDetail'
import { PublishedTemplateDetailScreen } from '@/features/published-templates/components/PublishedTemplateDetailScreen'
import { getCurrentUser } from '@/lib/api/auth/getCurrentUser'

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

  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }
  const isAdmin = user.role === 'admin' || user.role === 'system_admin'

  return (
    <PublishedTemplateDetailScreen
      key={stageKey}
      template={template}
      stageKey={stageKey}
      isAdmin={isAdmin}
    />
  )
}
