import { redirect } from 'next/navigation'
import { STAGE_ORDER } from '@/types/Project'

// /admin/templates/[templateId]ルート。先頭工程のテンプレート編集画面へリダイレクトする
export default async function AdminTemplatePage({
  params,
}: {
  params: Promise<{ templateId: string }>
}) {
  const { templateId } = await params
  redirect(`/admin/templates/${templateId}/${STAGE_ORDER[0]}`)
}
