'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useAtom } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { messages } from '@/constants/messages'
import { Skeleton } from '@/components/ui/skeleton'
import { OverallStatusTag } from '@/components/tag/OverallStatusTag'
import { Tag } from '@/components/tag/Tag'
import { getStage } from '@/lib/frontend/apiClient/stages/getStage'
import { projectDetailAtom } from '../stores/projectDetailAtom'
import { selectedStageKeyAtom } from '../stores/selectedStageKeyAtom'
import { stageDetailAtom } from '../stores/stageDetailAtom'
import { StageTabBar } from './StageWorkspace/StageTabBar'
import { StageQuestionForm } from './StageWorkspace/StageQuestionForm'
import { PromptPreview } from './StageWorkspace/PromptPreview'
import { ExecutionModeToggle } from './StageWorkspace/ExecutionModeToggle'
import { DeliverableEditor } from './StageWorkspace/DeliverableEditor'
import { QualityGateChecklist } from './StageWorkspace/QualityGateChecklist'
import type { ProjectDetail, StageKey, StageStatus } from '@/types/Project'
import type { StageDetail } from '@/types/Stage'

const STAGE_STATUS_TAG_CLASS: Record<StageStatus, string> = {
  not_started: 'bg-neutral-800 text-text',
  in_progress: 'border border-accent text-accent',
  quality_gate_pending: 'bg-accent-2-800 text-accent-2-100',
  completed: 'bg-accent-800 text-accent-100',
}

// 案件詳細画面（工程別進行画面）のエントリーポイント
export function StageWorkspace({
  projectId,
  initialProject,
  initialStage,
}: {
  projectId: string
  initialProject: ProjectDetail
  initialStage: StageDetail
}) {
  useHydrateAtoms([
    [projectDetailAtom, initialProject],
    [selectedStageKeyAtom, initialProject.currentStage],
    [stageDetailAtom, initialStage],
  ])
  const [project, setProject] = useAtom(projectDetailAtom)
  const [selectedStageKey, setSelectedStageKey] = useAtom(selectedStageKeyAtom)
  const [stage, setStage] = useAtom(stageDetailAtom)
  const [isStageLoading, setIsStageLoading] = useState(false)

  if (!project || !stage) return null

  const handleSelectStage = async (stageKey: StageKey) => {
    if (stageKey === selectedStageKey) return
    setIsStageLoading(true)
    const response = await getStage(projectId, stageKey)
    if (!('error' in response)) {
      setSelectedStageKey(stageKey)
      setStage(response)
    }
    setIsStageLoading(false)
  }

  const handleQualityGatePassed = (
    nextStageKey: StageKey | null,
    projectCompleted: boolean
  ) => {
    setProject((prev) =>
      prev
        ? {
            ...prev,
            currentStage: nextStageKey ?? prev.currentStage,
            overallStatus: projectCompleted ? 'completed' : prev.overallStatus,
            stages: prev.stages.map((s) =>
              s.stageKey === selectedStageKey
                ? { ...s, status: 'completed' }
                : s
            ),
          }
        : prev
    )
    if (nextStageKey) {
      void handleSelectStage(nextStageKey)
    } else {
      setStage((prev) => (prev ? { ...prev, status: 'completed' } : prev))
    }
  }

  const showForm =
    stage.status === 'not_started' || stage.status === 'in_progress'
  const showPromptOnly = showForm && stage.generatedPrompt !== ''
  const showDeliverable = stage.deliverable !== null

  return (
    <div className="mx-auto w-full max-w-300 flex-1 p-8">
      <Link
        href="/projects"
        className="mb-3 inline-flex items-center gap-1 text-[13px] text-text/60"
      >
        <ArrowLeft className="size-3.5" />
        {messages.stages.backToProjectsLink}
      </Link>

      <div className="mb-5 flex items-baseline gap-3">
        <h1 className="font-heading text-[42px] font-semibold">
          {project.name}
        </h1>
        <OverallStatusTag status={project.overallStatus} />
      </div>

      <StageTabBar
        stages={project.stages}
        selectedStageKey={selectedStageKey}
        onSelect={handleSelectStage}
      />

      {isStageLoading ? (
        <div className="mt-6 flex flex-col gap-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <div key={stage.stageKey} className="mt-5 flex flex-col gap-5">
          <div className="flex items-center gap-2.5">
            <h2 className="font-heading text-3xl font-medium">
              {messages.stages.stageNames[stage.stageKey]}
            </h2>
            <Tag className={STAGE_STATUS_TAG_CLASS[stage.status]}>
              {messages.stages.statusLabel[stage.status]}
            </Tag>
          </div>

          {showForm && (
            <StageQuestionForm
              projectId={projectId}
              stage={stage}
              onUpdated={setStage}
            />
          )}

          {showPromptOnly && (
            <div className="grid max-w-275 grid-cols-[1fr_320px] items-start gap-5">
              <PromptPreview promptText={stage.generatedPrompt} />
              <ExecutionModeToggle
                projectId={projectId}
                stage={stage}
                onUpdated={setStage}
              />
            </div>
          )}

          {showDeliverable && stage.deliverable && (
            <div className="grid max-w-275 grid-cols-[1fr_340px] items-start gap-5">
              <DeliverableEditor
                projectId={projectId}
                stageKey={stage.stageKey}
                deliverable={stage.deliverable}
                onSaved={(deliverable) => setStage({ ...stage, deliverable })}
              />
              <QualityGateChecklist
                projectId={projectId}
                stage={stage}
                onPassed={handleQualityGatePassed}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
