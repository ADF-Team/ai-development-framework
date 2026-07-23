import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PanelCard, PanelCardKicker } from '@/components/card/PanelCard'
import { messages } from '@/constants/messages'

// 案件詳細画面：生成されたプロンプトの表示・コピー
export function PromptPreview({ promptText }: { promptText: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(promptText)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <PanelCard>
      <PanelCardKicker>{messages.stages.promptPreview.label}</PanelCardKicker>
      <pre className="max-h-85 overflow-auto rounded-md border border-divider bg-bg p-3 font-mono text-[12.5px] leading-relaxed whitespace-pre-wrap">
        {promptText}
      </pre>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="self-start"
        onClick={handleCopy}
      >
        {copied ? <Check /> : <Copy />}
        {copied
          ? messages.stages.promptPreview.copiedButton
          : messages.stages.promptPreview.copyButton}
      </Button>
    </PanelCard>
  )
}
