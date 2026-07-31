import { useState } from 'react'
import { WandSparkles, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { messages } from '@/constants/messages'
import { useApiAction } from '@/hooks/useApiAction'
import { postAnswers } from '@/lib/frontend/apiClient/stages/postAnswers'
import { postGeneratePrompt } from '@/lib/frontend/apiClient/stages/postGeneratePrompt'
import { postExecuteStage } from '@/lib/frontend/apiClient/stages/postExecuteStage'
import { stageAnswersFormSchema } from '../../schemas/stageAnswersFormSchema'
import type { StageDetail } from '@/types/Stage'

// 案件詳細画面：工程の質問セットに回答するフォーム
export function StageQuestionForm({
  projectId,
  stage,
  onUpdated,
}: {
  projectId: string
  stage: StageDetail
  onUpdated: (stage: StageDetail) => void
}) {
  const [answers, setAnswers] = useState<Record<string, string>>(stage.answers)
  const [errorMessage, setErrorMessage] = useState('')
  const { run: runSaveAnswers, isLoading: isSaving } = useApiAction(postAnswers)
  const { run: runGeneratePrompt, isLoading: isGenerating } =
    useApiAction(postGeneratePrompt)
  const { run: runExecuteStage, isLoading: isExecuting } =
    useApiAction(postExecuteStage)

  const hasAnswer = stageAnswersFormSchema.safeParse(answers).success
  const isBusy = isSaving || isGenerating || isExecuting

  const validateAnswers = () => {
    const validation = stageAnswersFormSchema.safeParse(answers)
    if (!validation.success) {
      setErrorMessage(validation.error.issues[0].message)
      return false
    }
    setErrorMessage('')
    return true
  }

  const handleSave = async () => {
    const result = await runSaveAnswers(projectId, stage.stageKey, answers)
    if (result) onUpdated({ ...stage, answers, status: result.status })
  }

  const handleGenerate = async () => {
    if (!validateAnswers()) return
    const saveResult = await runSaveAnswers(projectId, stage.stageKey, answers)
    if (!saveResult) return
    const generateResult = await runGeneratePrompt(projectId, stage.stageKey)
    if (generateResult) {
      onUpdated({
        ...stage,
        answers,
        status: saveResult.status,
        generatedPrompt: generateResult.generatedPrompt,
      })
    }
  }

  const handleGenerateDeliverable = async () => {
    if (!validateAnswers()) return
    const saveResult = await runSaveAnswers(projectId, stage.stageKey, answers)
    if (!saveResult) return
    const generateResult = await runGeneratePrompt(projectId, stage.stageKey)
    if (!generateResult) return
    const executeResult = await runExecuteStage(projectId, stage.stageKey)
    if (executeResult) {
      onUpdated({
        ...stage,
        answers,
        status: 'quality_gate_pending',
        generatedPrompt: generateResult.generatedPrompt,
        deliverable: {
          id: executeResult.deliverableId,
          version: executeResult.version,
          content: executeResult.content,
          generationMethod: executeResult.generationMethod,
        },
      })
    }
  }

  return (
    <div className="flex max-w-190 flex-col gap-3.5">
      {stage.questions.map((question) => (
        <div key={question.id} className="flex flex-col gap-1.5">
          <Label htmlFor={question.id}>
            {question.order}. {question.text}
          </Label>
          <Textarea
            id={question.id}
            rows={2}
            placeholder={messages.stages.questionForm.answerPlaceholder}
            value={answers[question.id] ?? ''}
            onChange={(e) =>
              setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))
            }
          />
        </div>
      ))}
      <div className="mt-1 flex gap-2.5">
        <Button
          type="button"
          variant="secondary"
          disabled={isBusy}
          onClick={handleSave}
        >
          {messages.stages.questionForm.saveAnswersButton}
        </Button>
        <Button
          type="button"
          disabled={!hasAnswer || isBusy}
          onClick={handleGenerate}
        >
          <WandSparkles />
          {messages.stages.questionForm.generatePromptButton}
        </Button>
        <Button
          type="button"
          disabled={!hasAnswer || isBusy}
          onClick={handleGenerateDeliverable}
        >
          <Sparkles />
          {
            messages.stages.questionForm.generateDeliverableButton[
              stage.stageKey
            ]
          }
        </Button>
      </div>
      {errorMessage && (
        <p className="text-[13px] text-destructive">{errorMessage}</p>
      )}
    </div>
  )
}
