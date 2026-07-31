import { PanelCard, PanelCardKicker } from '@/components/card/PanelCard'
import { messages } from '@/constants/messages'
import type { TemplateQuestion } from '@/types/StageTemplate'

// 公開テンプレート詳細画面：質問セットの読み取り専用表示
export function QuestionListView({
  questions,
}: {
  questions: TemplateQuestion[]
}) {
  return (
    <PanelCard>
      <PanelCardKicker>
        {messages.adminTemplates.questionListLabel}
      </PanelCardKicker>
      <div className="flex flex-col">
        {questions.map((question) => (
          <div
            key={question.id}
            className="border-b border-divider py-1.5 text-[13px]"
          >
            {question.text}
          </div>
        ))}
      </div>
    </PanelCard>
  )
}
