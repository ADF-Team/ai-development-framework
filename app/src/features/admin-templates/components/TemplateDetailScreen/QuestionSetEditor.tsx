import { useState } from 'react'
import { Plus } from 'lucide-react'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PanelCard, PanelCardKicker } from '@/components/card/PanelCard'
import { messages } from '@/constants/messages'
import type { TemplateQuestion } from '@/types/StageTemplate'
import { SortableQuestionRow } from './QuestionSetEditor/SortableQuestionRow'

// 質問の並び順（orderフィールド）を配列のインデックスに合わせて振り直す
function withSequentialOrder(
  questions: TemplateQuestion[]
): TemplateQuestion[] {
  return questions.map((question, index) => ({
    ...question,
    order: index + 1,
  }))
}

// テンプレート詳細画面：質問の追加・編集・並び替え・削除
export function QuestionSetEditor({
  questions,
  onChange,
}: {
  questions: TemplateQuestion[]
  onChange: (questions: TemplateQuestion[]) => void
}) {
  const [newQuestionText, setNewQuestionText] = useState('')
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  )

  const handleUpdate = (id: string, text: string) => {
    onChange(
      questions.map((question) =>
        question.id === id ? { ...question, text } : question
      )
    )
  }

  const handleDelete = (id: string) => {
    onChange(
      withSequentialOrder(questions.filter((question) => question.id !== id))
    )
  }

  const handleAdd = () => {
    if (!newQuestionText.trim()) return
    onChange(
      withSequentialOrder([
        ...questions,
        { id: `q${Date.now()}`, text: newQuestionText, order: 0 },
      ])
    )
    setNewQuestionText('')
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = questions.findIndex(
      (question) => question.id === active.id
    )
    const newIndex = questions.findIndex((question) => question.id === over.id)
    onChange(withSequentialOrder(arrayMove(questions, oldIndex, newIndex)))
  }

  return (
    <PanelCard>
      <PanelCardKicker>
        {messages.adminTemplates.questionListLabel}
      </PanelCardKicker>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={questions.map((question) => question.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-1.5">
            {questions.map((question) => (
              <SortableQuestionRow
                key={question.id}
                question={question}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <div className="mt-2.5 flex gap-2">
        <Input
          placeholder={messages.adminTemplates.newQuestionPlaceholder}
          value={newQuestionText}
          onChange={(e) => setNewQuestionText(e.target.value)}
        />
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={handleAdd}
        >
          <Plus />
        </Button>
      </div>
    </PanelCard>
  )
}
