import Link from 'next/link'
import { cn } from '@/lib/utils'
import { messages } from '@/constants/messages'
import { STAGE_ORDER } from '@/types/Project'
import type { StageKey } from '@/types/Project'

// テンプレート詳細画面：7工程の選択タブ（工程ごとに/admin/templates/[templateId]/[stageKey]へ遷移する）
export function StageSelector({
  templateId,
  selectedStageKey,
}: {
  templateId: string
  selectedStageKey: StageKey
}) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-divider">
      {STAGE_ORDER.map((stageKey, index) => {
        const isSelected = stageKey === selectedStageKey

        return (
          <Link
            key={stageKey}
            href={`/admin/templates/${templateId}/${stageKey}`}
            className={cn(
              'border-b-2 px-3 py-2.5 text-[13px] whitespace-nowrap',
              isSelected
                ? 'border-accent text-text'
                : 'border-transparent text-text/60'
            )}
          >
            {index + 1}. {messages.stages.stageNames[stageKey]}
          </Link>
        )
      })}
    </div>
  )
}
