import { messages } from '@/constants/messages'
import { PublishedTemplateCard } from './PublishedTemplateListScreen/PublishedTemplateCard'
import type { PublishedTemplateSummary } from '@/types/PublishedTemplate'

// 公開テンプレート一覧画面（/templates/published）のエントリーポイント。全ロール閲覧可能な読み取り専用画面
export function PublishedTemplateListScreen({
  templates,
}: {
  templates: PublishedTemplateSummary[]
}) {
  return (
    <div className="mx-auto w-full max-w-300 flex-1 p-8">
      <h1 className="mb-1.5 font-heading text-[42px] font-semibold">
        {messages.publishedTemplates.listTitle}
      </h1>
      <p className="mb-6 text-[13px] text-text/60">
        {messages.publishedTemplates.listDescription}
      </p>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
        {templates.map((template) => (
          <PublishedTemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  )
}
