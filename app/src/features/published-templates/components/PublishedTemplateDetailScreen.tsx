import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Tag } from '@/components/tag/Tag'
import { messages } from '@/constants/messages'
import { StageTabs } from './PublishedTemplateDetailScreen/StageTabs'
import { QuestionListView } from './PublishedTemplateDetailScreen/QuestionListView'
import { PromptTemplateView } from './PublishedTemplateDetailScreen/PromptTemplateView'
import { QualityGateItemsView } from './PublishedTemplateDetailScreen/QualityGateItemsView'
import { AddToMyTemplatesButton } from './PublishedTemplateDetailScreen/AddToMyTemplatesButton'
import type { StageKey } from '@/types/Project'
import type { PublishedTemplateDetail } from '@/types/PublishedTemplate'

// 公開テンプレート詳細画面のエントリーポイント（読み取り専用。管理者権限の場合のみマイテンプレートへの追加ボタンを表示する）
export function PublishedTemplateDetailScreen({
  template,
  stageKey,
  isAdmin,
}: {
  template: PublishedTemplateDetail
  stageKey: StageKey
  isAdmin: boolean
}) {
  const stage = template.stages.find((s) => s.stageKey === stageKey)
  if (!stage) return null

  return (
    <div className="mx-auto w-full max-w-300 flex-1 p-8">
      <Link
        href="/templates/published"
        className="mb-3 inline-flex items-center gap-1 text-[13px] text-text/60"
      >
        <ArrowLeft className="size-3.5" />
        {messages.publishedTemplates.backToListLink}
      </Link>

      <div className="mb-5 flex items-baseline justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <h1 className="font-heading text-[24px] font-semibold">
            {template.title}
          </h1>
          <Tag className="border border-accent text-accent">
            v{template.version}
          </Tag>
        </div>
        {isAdmin && (
          <AddToMyTemplatesButton publishedTemplateId={template.id} />
        )}
      </div>

      <StageTabs templateId={template.id} selectedStageKey={stageKey} />

      <div className="mt-6 grid grid-cols-2 items-start gap-5">
        <QuestionListView questions={stage.questions} />
        <div className="flex flex-col gap-5">
          <PromptTemplateView value={stage.promptTemplate} />
          <QualityGateItemsView items={stage.qualityGateItems} />
        </div>
      </div>
    </div>
  )
}
