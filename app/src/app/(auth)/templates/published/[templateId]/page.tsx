import { redirect } from 'next/navigation'
import { STAGE_ORDER } from '@/types/Project'

// /templates/published/[templateId]ルート。先頭工程の公開テンプレート詳細画面へリダイレクトする
export default async function PublishedTemplatePage({
  params,
}: {
  params: Promise<{ templateId: string }>
}) {
  const { templateId } = await params
  redirect(`/templates/published/${templateId}/${STAGE_ORDER[0]}`)
}
