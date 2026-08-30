import { useState } from 'react'
import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { PanelCard, PanelCardKicker } from '@/components/card/PanelCard'
import { cn } from '@/lib/utils'
import { messages } from '@/constants/messages'
import { useApiAction } from '@/hooks/useApiAction'
import { postExecuteStage } from '@/lib/frontend/apiClient/stages/postExecuteStage'
import { patchDeliverable } from '@/lib/frontend/apiClient/stages/patchDeliverable'
import { deliverableContentFormSchema } from '@/schemas/deliverableContentFormSchema'
import type { StageDetail, ExecutionMode } from '@/types/Stage'

// 案件詳細画面：実行モード（アプリ内実行／プロンプトのみ）の切り替えと成果物生成
export function ExecutionModeToggle({
  projectId,
  stage,
  onUpdated,
}: {
  projectId: string
  stage: StageDetail
  onUpdated: (stage: StageDetail) => void
}) {
  const [mode, setMode] = useState<ExecutionMode>('ai_executed')
  const [pasteContent, setPasteContent] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const { run: runExecute, isLoading: isExecuting } =
    useApiAction(postExecuteStage)
  const { run: runSaveManual, isLoading: isSavingManual } =
    useApiAction(patchDeliverable)

  const handleExecute = async () => {
    const result = await runExecute(projectId, stage.stageKey)
    if (result) {
      onUpdated({
        ...stage,
        status: 'quality_gate_pending',
        deliverable: {
          id: result.deliverableId,
          version: result.version,
          content: result.content,
          generationMethod: result.generationMethod,
        },
      })
    }
  }

  const handleSaveManual = async () => {
    const validation = deliverableContentFormSchema.safeParse({
      content: pasteContent,
    })
    if (!validation.success) {
      setErrorMessage(validation.error.issues[0].message)
      return
    }
    setErrorMessage('')

    const result = await runSaveManual(projectId, stage.stageKey, pasteContent)
    if (result) {
      onUpdated({
        ...stage,
        status: 'quality_gate_pending',
        deliverable: {
          id: result.deliverableId,
          version: result.version,
          content: pasteContent,
          generationMethod: result.generationMethod,
        },
      })
    }
  }

  return (
    <PanelCard>
      <PanelCardKicker>{messages.stages.executionMode.label}</PanelCardKicker>

      <div className="flex overflow-hidden rounded-md border border-divider">
        <button
          type="button"
          onClick={() => setMode('ai_executed')}
          className={cn(
            'flex-1 rounded-l-md border-r border-divider px-3 py-1.5 text-[13px]',
            mode === 'ai_executed'
              ? 'text-accent shadow-[inset_0_0_0_1px_var(--color-accent)]'
              : 'hover:bg-text/7'
          )}
        >
          {messages.stages.executionMode.aiExecuted}
        </button>
        <button
          type="button"
          onClick={() => setMode('prompt_only')}
          className={cn(
            'flex-1 rounded-r-md px-3 py-1.5 text-[13px]',
            mode === 'prompt_only'
              ? 'text-accent shadow-[inset_0_0_0_1px_var(--color-accent)]'
              : 'hover:bg-text/7'
          )}
        >
          {messages.stages.executionMode.promptOnly}
        </button>
      </div>

      {mode === 'ai_executed' ? (
        <>
          <p className="text-[13px] opacity-80">
            {messages.stages.executionMode.aiExecutedDescription}
          </p>
          <Button
            type="button"
            className="w-full"
            disabled={isExecuting}
            onClick={handleExecute}
          >
            <Play />
            {messages.stages.executionMode.executeButton}
          </Button>
        </>
      ) : (
        <>
          <p className="text-[13px] opacity-80">
            {messages.stages.executionMode.promptOnlyDescription}
          </p>
          <Textarea
            rows={5}
            placeholder={messages.stages.executionMode.pastePlaceholder}
            value={pasteContent}
            onChange={(e) => setPasteContent(e.target.value)}
          />
          {errorMessage && (
            <p className="text-[13px] text-destructive">{errorMessage}</p>
          )}
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            disabled={isSavingManual}
            onClick={handleSaveManual}
          >
            {messages.stages.executionMode.saveButton}
          </Button>
        </>
      )}
    </PanelCard>
  )
}
