import { cn } from '@/lib/utils'
import { messages } from '@/constants/messages'
import { Tag } from './Tag'
import type { OverallStatus } from '@/types/Project'

// 案件の全体ステータス（進行中／完了）を表すタグ。案件一覧・案件詳細で共通利用する
export function OverallStatusTag({
  status,
  className,
}: {
  status: OverallStatus
  className?: string
}) {
  const isCompleted = status === 'completed'

  return (
    <Tag
      className={cn(
        isCompleted
          ? 'bg-accent-800 text-accent-100'
          : 'border border-accent text-accent',
        className
      )}
    >
      {isCompleted
        ? messages.projects.overallStatusLabel.completed
        : messages.projects.overallStatusLabel.inProgress}
    </Tag>
  )
}
