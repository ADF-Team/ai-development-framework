import { Textarea } from '@/components/ui/textarea'
import { PanelCard, PanelCardKicker } from '@/components/card/PanelCard'
import { messages } from '@/constants/messages'

// テンプレート詳細画面：プロンプトテンプレートの編集（回答プレースホルダー {{answer:qN}} を含むテキスト）
export function PromptTemplateEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <PanelCard>
      <PanelCardKicker>
        {messages.adminTemplates.promptTemplateLabel}
      </PanelCardKicker>
      <Textarea
        rows={10}
        className="field-sizing-fixed h-96 overflow-y-auto font-mono text-[12.5px] leading-relaxed"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </PanelCard>
  )
}
