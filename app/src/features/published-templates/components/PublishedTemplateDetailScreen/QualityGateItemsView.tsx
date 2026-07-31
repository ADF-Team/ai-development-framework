import { PanelCard, PanelCardKicker } from '@/components/card/PanelCard'
import { messages } from '@/constants/messages'
import type { TemplateQualityGateItem } from '@/types/StageTemplate'

// 公開テンプレート詳細画面：品質ゲート項目の読み取り専用表示
export function QualityGateItemsView({
  items,
}: {
  items: TemplateQualityGateItem[]
}) {
  return (
    <PanelCard>
      <PanelCardKicker>
        {messages.adminTemplates.qualityGateLabel}
      </PanelCardKicker>
      <div className="flex flex-col">
        {items.map((item) => (
          <div
            key={item.id}
            className="border-b border-divider py-1.5 text-[13px]"
          >
            {item.label}
          </div>
        ))}
      </div>
    </PanelCard>
  )
}
