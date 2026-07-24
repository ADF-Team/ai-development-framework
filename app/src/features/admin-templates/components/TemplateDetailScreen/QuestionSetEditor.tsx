import { useState } from 'react'
import { GripVertical, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PanelCard, PanelCardKicker } from '@/components/card/PanelCard'
import { messages } from '@/constants/messages'
import type { TemplateQuestion } from '@/types/StageTemplate'

// テンプレート詳細画面：質問の追加・削除
export function QuestionSetEditor({
  questions,
  onChange,
}: {
  questions: TemplateQuestion[]
  onChange: (questions: TemplateQuestion[]) => void
}) {
  const [newQuestionText, setNewQuestionText] = useState('')

  const handleDelete = (id: string) => {
    onChange(questions.filter((question) => question.id !== id))
  }

  const handleAdd = () => {
    if (!newQuestionText.trim()) return
    onChange([
      ...questions,
      { id: `q${Date.now()}`, text: newQuestionText, order: questions.length + 1 },
    ])
    setNewQuestionText('')
  }

  return (
    <PanelCard>
      <PanelCardKicker>{messages.adminTemplates.questionListLabel}</PanelCardKicker>
      <div className="flex flex-col">
        {questions.map((question) => (
          <div
            key={question.id}
            className="flex items-center gap-2 border-b border-divider py-1.5"
          >
            <GripVertical className="size-4 text-text/40" />
            <span className="flex-1 text-[13px]">{question.text}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => handleDelete(question.id)}
            >
              <Trash2 />
            </Button>
          </div>
        ))}
      </div>
      <div className="mt-2.5 flex gap-2">
        <Input
          placeholder={messages.adminTemplates.newQuestionPlaceholder}
          value={newQuestionText}
          onChange={(e) => setNewQuestionText(e.target.value)}
        />
        <Button type="button" variant="secondary" size="icon" onClick={handleAdd}>
          <Plus />
        </Button>
      </div>
    </PanelCard>
  )
}
