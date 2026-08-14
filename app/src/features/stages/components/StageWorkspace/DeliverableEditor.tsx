import { useState } from 'react'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { PanelCard, PanelCardKicker } from '@/components/card/PanelCard'
import { Tag } from '@/components/tag/Tag'
import { messages } from '@/constants/messages'
import { useApiAction } from '@/hooks/useApiAction'
import { patchDeliverable } from '@/lib/frontend/apiClient/stages/patchDeliverable'
import { deliverableContentFormSchema } from '@/schemas/deliverableContentFormSchema'
import type { StageKey } from '@/types/Project'
import type { DeliverableData } from '@/types/Deliverable'

// 案件詳細画面：成果物の表示・編集
export function DeliverableEditor({
  projectId,
  stageKey,
  deliverable,
  onSaved,
}: {
  projectId: string
  stageKey: StageKey
  deliverable: DeliverableData
  onSaved: (deliverable: DeliverableData) => void
}) {
  const [content, setContent] = useState(deliverable.content)
  const [errorMessage, setErrorMessage] = useState('')
  const { run, isLoading } = useApiAction(patchDeliverable)
  const hasChanges = content !== deliverable.content

  const handleSave = async () => {
    const validation = deliverableContentFormSchema.safeParse({ content })
    if (!validation.success) {
      setErrorMessage(validation.error.issues[0].message)
      return
    }
    setErrorMessage('')

    const result = await run(projectId, stageKey, content)
    if (result) {
      onSaved({
        id: result.deliverableId,
        version: result.version,
        content,
        generationMethod: result.generationMethod,
      })
    }
  }

  return (
    <PanelCard>
      <div className="flex items-center gap-2">
        <PanelCardKicker>{messages.stages.deliverable.label}</PanelCardKicker>
        <Tag className="border border-accent text-accent">
          v{deliverable.version}
        </Tag>
        <Tag className="bg-neutral-800">
          {
            messages.stages.deliverable.methodLabel[
              deliverable.generationMethod
            ]
          }
        </Tag>
      </div>
      <Textarea
        rows={14}
        className="font-mono text-[12.5px] leading-relaxed"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      {errorMessage && (
        <p className="text-[13px] text-destructive">{errorMessage}</p>
      )}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="self-start px-[2.8px] text-accent hover:bg-accent/10 hover:text-accent active:bg-accent/18"
        disabled={isLoading || !hasChanges}
        onClick={handleSave}
      >
        <Save />
        {messages.stages.deliverable.saveButton}
      </Button>
    </PanelCard>
  )
}
