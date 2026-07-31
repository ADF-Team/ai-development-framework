import { PanelCard, PanelCardKicker } from '@/components/card/PanelCard'
import { messages } from '@/constants/messages'

// 公開テンプレート詳細画面：プロンプトテンプレートの読み取り専用表示
export function PromptTemplateView({ value }: { value: string }) {
  return (
    <PanelCard>
      <PanelCardKicker>
        {messages.adminTemplates.promptTemplateLabel}
      </PanelCardKicker>
      <pre className="h-96 overflow-y-auto rounded-md border border-divider bg-bg p-2.5 font-mono text-[12.5px] leading-relaxed whitespace-pre-wrap">
        {value}
      </pre>
    </PanelCard>
  )
}
