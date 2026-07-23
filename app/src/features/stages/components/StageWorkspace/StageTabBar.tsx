import { CircleDashed, Pencil, Hourglass, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { messages } from '@/constants/messages'
import { STAGE_ORDER } from '@/types/Project'
import type {
  ProjectStageSummary,
  StageKey,
  StageStatus,
} from '@/types/Project'

const STATUS_ICON: Record<StageStatus, typeof CircleDashed> = {
  not_started: CircleDashed,
  in_progress: Pencil,
  quality_gate_pending: Hourglass,
  completed: CheckCircle2,
}

// 案件詳細画面：7工程タブ（完了済み／現在地／未着手をステータス色分け）
export function StageTabBar({
  stages,
  selectedStageKey,
  onSelect,
}: {
  stages: ProjectStageSummary[]
  selectedStageKey: StageKey
  onSelect: (stageKey: StageKey) => void
}) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-divider">
      {STAGE_ORDER.map((stageKey, index) => {
        const status =
          stages.find((s) => s.stageKey === stageKey)?.status ?? 'not_started'
        const isSelected = stageKey === selectedStageKey
        const Icon = STATUS_ICON[status]

        return (
          <button
            key={stageKey}
            type="button"
            onClick={() => onSelect(stageKey)}
            className={cn(
              'flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-[13px] whitespace-nowrap',
              isSelected
                ? 'border-accent text-text'
                : cn(
                    'border-transparent',
                    status === 'not_started' ? 'text-text/45' : 'text-text/75'
                  )
            )}
          >
            <Icon
              className={cn(
                'size-3.5',
                status === 'completed' && 'text-accent'
              )}
            />
            <span>
              {index + 1}. {messages.stages.stageNames[stageKey]}
            </span>
          </button>
        )
      })}
    </div>
  )
}
