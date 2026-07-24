import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, Copy } from 'lucide-react'
import { Tag } from '@/components/tag/Tag'
import { Button } from '@/components/ui/button'
import { messages } from '@/constants/messages'
import { useApiAction } from '@/hooks/useApiAction'
import { duplicateTemplate } from '@/lib/api/adminTemplates/duplicateTemplate'
import type { TemplateSummary } from '@/types/StageTemplate'

// マイテンプレート一覧の1件分。テンプレート名・現在バージョン・最終更新日時・更新者を表示する
export function TemplateCard({ template }: { template: TemplateSummary }) {
  const router = useRouter()
  const { run: runDuplicate, isLoading: isDuplicating } =
    useApiAction(duplicateTemplate)

  const handleDuplicate = async () => {
    const id = await runDuplicate(template.id)
    if (id) {
      router.push(`/admin/templates/${id}`)
    }
  }

  return (
    <div className="relative flex flex-col justify-between gap-[5.6px] rounded-md bg-surface p-[8.4px] shadow-sm">
      <Link
        href={`/admin/templates/${template.id}`}
        className="absolute inset-0 rounded-md"
        aria-label={template.title}
      />

      <div className="flex items-start gap-2">
        <span className="min-w-0 flex-1 font-heading text-[17px] leading-tight font-medium">
          {template.title}
        </span>
        <Tag className="border border-accent text-accent">
          v{template.version}
        </Tag>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="relative z-10"
          disabled={isDuplicating}
          onClick={handleDuplicate}
          aria-label={messages.adminTemplates.duplicateButtonLabel}
          title={messages.adminTemplates.duplicateButtonLabel}
        >
          <Copy />
        </Button>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-text/50">
        <Calendar className="size-3" />
        {template.updatedAt}・{template.updatedBy}
      </div>
    </div>
  )
}
