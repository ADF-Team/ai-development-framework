import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, Copy, Trash2 } from 'lucide-react'
import { Tag } from '@/components/tag/Tag'
import { Button } from '@/components/ui/button'
import { messages } from '@/constants/messages'
import { useApiAction } from '@/hooks/useApiAction'
import { duplicateTemplate } from '@/lib/frontend/apiClient/adminTemplates/duplicateTemplate'
import { postPublishTemplate } from '@/lib/frontend/apiClient/adminTemplates/postPublishTemplate'
import { postUnpublishTemplate } from '@/lib/frontend/apiClient/adminTemplates/postUnpublishTemplate'
import { deleteTemplate } from '@/lib/frontend/apiClient/adminTemplates/deleteTemplate'
import { PublishConfirmModal } from './PublishConfirmModal'
import { DeleteTemplateModal } from './DeleteTemplateModal'
import type { TemplateSummary } from '@/types/StageTemplate'

// マイテンプレート一覧の1件分。テンプレート名・現在バージョン・最終更新日時・更新者・公開状態を表示する
export function TemplateCard({
  template,
  onUpdated,
  onDeleted,
}: {
  template: TemplateSummary
  onUpdated: (template: TemplateSummary) => void
  onDeleted: (templateId: string) => void
}) {
  const router = useRouter()
  const { run: runDuplicate, isLoading: isDuplicating } =
    useApiAction(duplicateTemplate)
  const { run: runPublish, isLoading: isPublishing } =
    useApiAction(postPublishTemplate)
  const { run: runUnpublish, isLoading: isUnpublishing } = useApiAction(
    postUnpublishTemplate
  )
  const { run: runDelete, isLoading: isDeleting } = useApiAction(deleteTemplate)
  const [showPublishConfirm, setShowPublishConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDuplicate = async () => {
    const id = await runDuplicate(template.id)
    if (id) {
      router.push(`/admin/templates/${id}`)
    }
  }

  const handlePublish = async () => {
    setShowPublishConfirm(false)
    const result = await runPublish(template.id)
    if (result) {
      onUpdated({ ...template, isPublished: true })
    }
  }

  const handleUnpublish = async () => {
    const result = await runUnpublish(template.id)
    if (result) {
      onUpdated({ ...template, isPublished: false })
    }
  }

  const handleDelete = async () => {
    setShowDeleteConfirm(false)
    const result = await runDelete(template.id)
    if (result) {
      onDeleted(template.id)
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
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="relative z-10 text-destructive hover:text-destructive"
          disabled={isDeleting}
          onClick={() => setShowDeleteConfirm(true)}
          aria-label={messages.adminTemplates.deleteButtonLabel}
          title={messages.adminTemplates.deleteButtonLabel}
        >
          <Trash2 />
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
      <DeleteTemplateModal
        open={showDeleteConfirm}
        isPublished={template.isPublished}
        isDeleting={isDeleting}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
