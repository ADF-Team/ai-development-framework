'use client'

import { useRouter } from 'next/navigation'
import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { messages } from '@/constants/messages'
import { useApiAction } from '@/hooks/useApiAction'
import { duplicateTemplate } from '@/lib/frontend/apiClient/adminTemplates/duplicateTemplate'

// 公開テンプレート詳細画面：「マイテンプレートに追加」ボタン（管理者権限にのみ表示。複製APIは既存の複製機能と共通）
export function AddToMyTemplatesButton({
  publishedTemplateId,
}: {
  publishedTemplateId: string
}) {
  const router = useRouter()
  const { run: runDuplicate, isLoading } = useApiAction(duplicateTemplate)

  const handleClick = async () => {
    const id = await runDuplicate(publishedTemplateId)
    if (id) {
      router.push(`/admin/templates/${id}`)
    }
  }

  return (
    <Button type="button" disabled={isLoading} onClick={handleClick}>
      <Copy />
      {messages.publishedTemplates.addToMyTemplatesButton}
    </Button>
  )
}
