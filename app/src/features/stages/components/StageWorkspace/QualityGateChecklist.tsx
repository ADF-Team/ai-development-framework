import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { PanelCard, PanelCardKicker } from '@/components/card/PanelCard'
import { messages } from '@/constants/messages'
import { useApiAction } from '@/hooks/useApiAction'
import { postQualityGate } from '@/lib/frontend/apiClient/stages/postQualityGate'
import type { StageKey } from '@/types/Project'
import type { StageDetail } from '@/types/Stage'

// 案件詳細画面：品質ゲートのチェックリストと次工程への移行
export function QualityGateChecklist({
  projectId,
  stage,
  onPassed,
}: {
  projectId: string
  stage: StageDetail
  onPassed: (nextStageKey: StageKey | null, projectCompleted: boolean) => void
}) {
  const [checkedIds, setCheckedIds] = useState<string[]>(
    stage.qualityGateItems
      .filter((item) => stage.qualityGateResult[item.id]?.checked)
      .map((item) => item.id)
  )
  const { run, isLoading } = useApiAction(postQualityGate)

  const isCompleted = stage.status === 'completed'
  const allChecked = checkedIds.length === stage.qualityGateItems.length

  const toggle = (itemId: string) => {
    setCheckedIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleAdvance = async () => {
    const result = await run(projectId, stage.stageKey, checkedIds)
    if (result?.passed) {
      onPassed(result.nextStage, result.projectCompleted)
    }
  }

  return (
    <PanelCard>
      <PanelCardKicker>{messages.stages.qualityGate.label}</PanelCardKicker>
      <div className="flex flex-col gap-0.5">
        {stage.qualityGateItems.map((item) => (
          <label
            key={item.id}
            className="flex items-start gap-2 py-1.5 text-[13px] leading-snug"
          >
            <Checkbox
              checked={checkedIds.includes(item.id)}
              disabled={isCompleted}
              onCheckedChange={() => toggle(item.id)}
              className="mt-0.5"
            />
            {item.label}
          </label>
        ))}
      </div>
      <Button
        type="button"
        className="w-full"
        disabled={isCompleted || !allChecked || isLoading}
        onClick={handleAdvance}
      >
        {isCompleted
          ? messages.stages.qualityGate.completedButton
          : messages.stages.qualityGate.advanceButton}
        <ArrowRight />
      </Button>
    </PanelCard>
  )
}
