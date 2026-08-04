import { GripVertical, Trash2 } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { TemplateQuestion } from '@/types/StageTemplate'

// QuestionSetEditorの質問1行分。ドラッグハンドルで並び替え可能
export function SortableQuestionRow({
  question,
  onUpdate,
  onDelete,
}: {
  question: TemplateQuestion
  onUpdate: (id: string, text: string) => void
  onDelete: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('flex items-center gap-2', isDragging && 'z-10 opacity-50')}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-text/40 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <Input
        value={question.text}
        onChange={(e) => onUpdate(question.id, e.target.value)}
        className="h-8 flex-1 text-[13px]"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => onDelete(question.id)}
      >
        <Trash2 />
      </Button>
    </div>
  )
}
