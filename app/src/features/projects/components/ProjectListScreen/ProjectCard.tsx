import Link from 'next/link'
import { Calendar } from 'lucide-react'
import { messages } from '@/constants/messages'
import { cn } from '@/lib/utils'
import type { ProjectListItem, StageStatus } from '@/types/Project'

const STAGE_KEYS = Object.keys(
  messages.stages.stageNames
) as (keyof typeof messages.stages.stageNames)[]

const SEGMENT_COLOR: Record<StageStatus, string> = {
  not_started: 'bg-neutral-800',
  in_progress: 'bg-accent-700',
  quality_gate_pending: 'bg-accent-500',
  completed: 'bg-accent-300',
}

// 案件一覧の1件分。案件名・現在工程・7工程の進捗バー・作成日を表示する
export function ProjectCard({ project }: { project: ProjectListItem }) {
  const isCompleted = project.overallStatus === 'completed'

  return (
    <Link
      href={`/projects/${project.id}`}
      className="flex flex-col gap-[5.6px] rounded-md bg-surface p-[8.4px] shadow-sm"
    >
      <div className="flex items-center gap-2">
        <span className="text-[10px] tracking-widest text-accent uppercase">
          {messages.stages.stageNames[project.currentStage]}
        </span>
        <span
          className={cn(
            'ml-auto inline-flex items-center rounded-[6px] px-2.5 py-0.75 text-[11px] tracking-[0.02em]',
            isCompleted
              ? 'bg-accent-800 text-accent-100'
              : 'border border-accent text-accent'
          )}
        >
          {isCompleted
            ? messages.projects.overallStatusLabel.completed
            : messages.projects.overallStatusLabel.inProgress}
        </span>
      </div>

      <div className="font-heading text-[17px] leading-tight font-medium">
        {project.name}
      </div>

      <div className="my-0.5 flex gap-0.75">
        {STAGE_KEYS.map((stageKey) => (
          <div
            key={stageKey}
            className={cn(
              'h-1.5 flex-1 rounded-sm',
              SEGMENT_COLOR[project.stageStatuses[stageKey]]
            )}
          />
        ))}
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-text/50">
        <Calendar className="size-3" />
        {messages.projects.createdAtLabel}
        {project.createdAt}
      </div>
    </Link>
  )
}
