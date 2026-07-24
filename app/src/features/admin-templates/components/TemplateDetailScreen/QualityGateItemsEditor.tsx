import { useState } from 'react'
import { CheckSquare, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PanelCard, PanelCardKicker } from '@/components/card/PanelCard'
import { messages } from '@/constants/messages'
import type { TemplateQualityGateItem } from '@/types/StageTemplate'

// テンプレート詳細画面：品質ゲート項目の追加・削除
export function QualityGateItemsEditor({
  items,
  onChange,
}: {
  items: TemplateQualityGateItem[]
  onChange: (items: TemplateQualityGateItem[]) => void
}) {
  const [newGateText, setNewGateText] = useState('')

  const handleDelete = (id: string) => {
    onChange(items.filter((item) => item.id !== id))
  }

  const handleAdd = () => {
    if (!newGateText.trim()) return
    onChange([
      ...items,
      { id: `g${Date.now()}`, label: newGateText, order: items.length + 1 },
    ])
    setNewGateText('')
  }

  return (
    <PanelCard>
      <PanelCardKicker>
        {messages.adminTemplates.qualityGateLabel}
      </PanelCardKicker>
      <div className="flex flex-col">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2 border-b border-divider py-1.5"
          >
            <CheckSquare className="size-4 text-text/40" />
            <span className="flex-1 text-[13px]">{item.label}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => handleDelete(item.id)}
            >
              <Trash2 />
            </Button>
          </div>
        ))}
      </div>
      <div className="mt-2.5 flex gap-2">
        <Input
          placeholder={messages.adminTemplates.newGateItemPlaceholder}
          value={newGateText}
          onChange={(e) => setNewGateText(e.target.value)}
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
