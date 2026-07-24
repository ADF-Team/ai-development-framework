import { notFound } from 'next/navigation'
import { isStageKey } from '@/types/Project'
import { getStageTemplate } from '@/lib/api/adminTemplates/getStageTemplate'
import { TemplateDetailScreen } from '@/features/admin-templates/components/TemplateDetailScreen'

// テンプレート詳細画面（/admin/templates/[templateId]/[stageKey]）
export default async function AdminTemplateStagePage({
  params,
}: {
  params: Promise<{ templateId: string; stageKey: string }>
}) {
  const { templateId, stageKey } = await params
  if (!isStageKey(stageKey)) {
    notFound()
  }

  const template = await getStageTemplate(templateId, stageKey)
  if ('error' in template) {
    notFound()
  }

  return (
    <TemplateDetailScreen
      key={stageKey}
      templateId={templateId}
      stageKey={stageKey}
      initialTemplate={template}
    />
  )
}
