'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, FolderPlus, Save } from 'lucide-react'
import { useAtom } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { messages } from '@/constants/messages'
import { NAME_MAX_LENGTH } from '@/constants/validation'
import { useApiAction } from '@/hooks/useApiAction'
import { getStageTemplate } from '@/lib/api/adminTemplates/getStageTemplate'
import { putStageTemplate } from '@/lib/api/adminTemplates/putStageTemplate'
import { getProjectsUsingTemplate } from '@/lib/api/adminTemplates/getProjectsUsingTemplate'
import { stageTemplateAtom } from '../stores/stageTemplateAtom'
import { stageTemplateFormSchema } from '../schemas/stageTemplateFormSchema'
import { StageSelector } from './TemplateDetailScreen/StageSelector'
import { QuestionSetEditor } from './TemplateDetailScreen/QuestionSetEditor'
import { PromptTemplateEditor } from './TemplateDetailScreen/PromptTemplateEditor'
import { QualityGateItemsEditor } from './TemplateDetailScreen/QualityGateItemsEditor'
import { VersionHistoryPanel } from './TemplateDetailScreen/VersionHistoryPanel'
import { SaveImpactModal } from './TemplateDetailScreen/SaveImpactModal'
import type { StageKey } from '@/types/Project'
import type {
  StageTemplateDetail,
  TemplateQuestion,
  TemplateQualityGateItem,
} from '@/types/StageTemplate'

// テンプレート詳細画面（管理者用）のエントリーポイント。マイテンプレート一覧の各カードから遷移する
export function TemplateDetailScreen({
  templateId,
  stageKey,
  initialTemplate,
}: {
  templateId: string
  stageKey: StageKey
  initialTemplate: StageTemplateDetail
}) {
  useHydrateAtoms([[stageTemplateAtom, initialTemplate]])
  const [template, setTemplate] = useAtom(stageTemplateAtom)
  const [title, setTitle] = useState(initialTemplate.title)
  const [questions, setQuestions] = useState<TemplateQuestion[]>(
    initialTemplate.questions
  )
  const [promptTemplate, setPromptTemplate] = useState(
    initialTemplate.promptTemplate
  )
  const [qualityGateItems, setQualityGateItems] = useState<
    TemplateQualityGateItem[]
  >(initialTemplate.qualityGateItems)
  const [errorMessage, setErrorMessage] = useState('')
  const [isCheckingImpact, setIsCheckingImpact] = useState(false)
  const [affectedProjects, setAffectedProjects] = useState<
    { id: string; name: string }[]
  >([])
  const [showImpactModal, setShowImpactModal] = useState(false)
  const { run: runSave, isLoading: isSaving } = useApiAction(putStageTemplate)

  if (!template) return null

  const hasChanges =
    title !== template.title ||
    JSON.stringify(questions) !== JSON.stringify(template.questions) ||
    promptTemplate !== template.promptTemplate ||
    JSON.stringify(qualityGateItems) !==
      JSON.stringify(template.qualityGateItems)

  const handleSave = async () => {
    setShowImpactModal(false)

    const version = await runSave(templateId, stageKey, {
      templateId,
      stageKey,
      title,
      questions,
      promptTemplate,
      qualityGateItems,
    })
    if (version === null) return

    const refreshed = await getStageTemplate(templateId, stageKey)
    if (!('error' in refreshed)) {
      setTemplate(refreshed)
      setTitle(refreshed.title)
      setQuestions(refreshed.questions)
      setPromptTemplate(refreshed.promptTemplate)
      setQualityGateItems(refreshed.qualityGateItems)
    }
  }

  const handleSaveClick = async () => {
    const validation = stageTemplateFormSchema.safeParse({
      title,
      questions,
      promptTemplate,
      qualityGateItems,
    })
    if (!validation.success) {
      setErrorMessage(validation.error.issues[0].message)
      return
    }
    setErrorMessage('')

    setIsCheckingImpact(true)
    const impact = await getProjectsUsingTemplate(templateId)
    setIsCheckingImpact(false)

    if (!('error' in impact) && impact.projects.length > 0) {
      setAffectedProjects(impact.projects)
      setShowImpactModal(true)
      return
    }
    await handleSave()
  }

  return (
    <div className="mx-auto w-full max-w-300 flex-1 p-8">
      <Link
        href="/admin/templates"
        className="mb-3 inline-flex items-center gap-1 text-[13px] text-text/60"
      >
        <ArrowLeft className="size-3.5" />
        {messages.adminTemplates.backToListLink}
      </Link>

      <div className="mb-5 flex items-start justify-between gap-4">
        <Input
          value={title}
          placeholder={messages.adminTemplates.titlePlaceholder}
          maxLength={NAME_MAX_LENGTH}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 h-auto font-heading text-[24px] font-semibold md:text-[24px]"
        />
        <div className="mt-1 flex shrink-0 gap-2.5">
          <Button type="button" variant="outline" asChild>
            <Link href={`/projects?newFromTemplate=${templateId}`}>
              <FolderPlus />
              {messages.adminTemplates.createProjectButton}
            </Link>
          </Button>
          <Button
            type="button"
            disabled={!hasChanges || isSaving || isCheckingImpact}
            onClick={handleSaveClick}
          >
            <Save />
            {messages.adminTemplates.saveButton}
          </Button>
        </div>
      </div>

      <StageSelector templateId={templateId} selectedStageKey={stageKey} />

      <div className="mt-6 grid grid-cols-[1fr_1fr_260px] items-start gap-5">
        <QuestionSetEditor questions={questions} onChange={setQuestions} />
        <div className="flex flex-col gap-5">
          <PromptTemplateEditor
            value={promptTemplate}
            onChange={setPromptTemplate}
          />
          <QualityGateItemsEditor
            items={qualityGateItems}
            onChange={setQualityGateItems}
          />
        </div>
        <VersionHistoryPanel
          templateId={templateId}
          stageKey={stageKey}
          versions={template.versions}
          currentVersion={template.version}
        />
      </div>

      {errorMessage && (
        <p className="mt-3 text-[13px] text-destructive">{errorMessage}</p>
      )}

      <SaveImpactModal
        open={showImpactModal}
        projects={affectedProjects}
        isSaving={isSaving}
        onCancel={() => setShowImpactModal(false)}
        onConfirm={handleSave}
      />
    </div>
  )
}
