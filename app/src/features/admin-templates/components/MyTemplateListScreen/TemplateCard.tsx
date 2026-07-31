import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, Copy } from 'lucide-react'
import { Tag } from '@/components/tag/Tag'
import { Button } from '@/components/ui/button'
import { messages } from '@/constants/messages'
import { useApiAction } from '@/hooks/useApiAction'
import { duplicateTemplate } from '@/lib/api/adminTemplates/duplicateTemplate'
import { postPublishTemplate } from '@/lib/api/adminTemplates/postPublishTemplate'
import { postUnpublishTemplate } from '@/lib/api/adminTemplates/postUnpublishTemplate'
import { PublishConfirmModal } from './PublishConfirmModal'
import type { TemplateSummary } from '@/types/StageTemplate'

// マイテンプレート一覧の1件分。テンプレート名・現在バージョン・最終更新日時・更新者・公開状態を表示する
export function TemplateCard({ template }: { template: TemplateSummary }) {
  const router = useRouter()
  const { run: runDuplicate, isLoading: isDuplicating } =
    useApiAction(duplicateTemplate)
  const { run: runPublish, isLoading: isPublishing } =
    useApiAction(postPublishTemplate)
  const { run: runUnpublish, isLoading: isUnpublishing } = useApiAction(
    postUnpublishTemplate
  )
  const [showPublishConfirm, setShowPublishConfirm] = useState(false)

  const handleDuplicate = async () => {
    const id = await runDuplicate(template.id)
    if (id) {
      router.push(`/admin/templates/${id}`)
    }
  }

  const handlePublish = async () => {
    setShowPublishConfirm(false)
    await runPublish(template.id)
  }

  const handleUnpublish = async () => {
    await runUnpublish(template.id)
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
        {template.isPublished && (
          <Tag className="border border-accent bg-accent/10 text-accent">
            {messages.adminTemplates.publishedTag}
          </Tag>
        )}
        {!template.isPublished && template.showPublishedTag && (
          <Tag className="border border-divider text-text/60">
            {messages.adminTemplates.publishedTemplateTag}
          </Tag>
        )}
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

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-text/50">
          <Calendar className="size-3" />
          {template.updatedAt}・{template.updatedBy}
        </div>

        {template.isPublished && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="relative z-10 h-auto px-1.5 py-1 text-[11px] text-text/60"
            disabled={isUnpublishing}
            onClick={handleUnpublish}
          >
            {messages.adminTemplates.unpublishButton}
          </Button>
        )}
        {!template.isPublished && !template.showPublishedTag && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="relative z-10 h-auto px-1.5 py-1 text-[11px] text-accent"
            onClick={() => setShowPublishConfirm(true)}
          >
            {messages.adminTemplates.publishButton}
          </Button>
        )}
      </div>

      <PublishConfirmModal
        open={showPublishConfirm}
        isPublishing={isPublishing}
        onCancel={() => setShowPublishConfirm(false)}
        onConfirm={handlePublish}
      />
    </div>
  )
}
