import Link from 'next/link'
import { Calendar } from 'lucide-react'
import { Tag } from '@/components/tag/Tag'
import type { PublishedTemplateSummary } from '@/types/PublishedTemplate'

// 公開テンプレート一覧の1件分。テンプレート名・現在バージョン・公開日時を表示する（全社公開のため作成者名は表示しない。閲覧のみ、複製ボタンは持たない）
export function PublishedTemplateCard({
  template,
}: {
  template: PublishedTemplateSummary
}) {
  return (
    <Link
      href={`/templates/published/${template.id}`}
      className="flex flex-col gap-[5.6px] rounded-md bg-surface p-[8.4px] shadow-sm"
    >
      <div className="flex items-start gap-2">
        <span className="min-w-0 flex-1 font-heading text-[17px] leading-tight font-medium">
          {template.title}
        </span>
        <Tag className="border border-accent text-accent">
          v{template.version}
        </Tag>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-text/50">
        <Calendar className="size-3" />
        {template.publishedAt}
      </div>
    </Link>
  )
}
