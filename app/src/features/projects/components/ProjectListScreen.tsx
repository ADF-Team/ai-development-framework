'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAtom } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { projectsAtom } from '../stores/projectsAtom'
import { ProjectListHeader } from './ProjectListScreen/ProjectListHeader'
import { ProjectCard } from './ProjectListScreen/ProjectCard'
import { NewProjectModal } from './ProjectListScreen/NewProjectModal'
import type { ProjectListItem } from '@/types/Project'
import type { PublishedTemplateSummary } from '@/types/PublishedTemplate'

// 案件一覧画面（/projects）のエントリーポイント
export function ProjectListScreen({
  initialProjects,
  templates,
}: {
  initialProjects: ProjectListItem[]
  templates: PublishedTemplateSummary[]
}) {
  useHydrateAtoms([[projectsAtom, initialProjects]])
  const [projects, setProjects] = useAtom(projectsAtom)
  const searchParams = useSearchParams()
  const newFromTemplate = searchParams.get('newFromTemplate') ?? undefined
  const [showNewProjectModal, setShowNewProjectModal] = useState(
    Boolean(newFromTemplate)
  )

  return (
    <div className="mx-auto w-full max-w-300 flex-1 p-8">
      <ProjectListHeader onNewProject={() => setShowNewProjectModal(true)} />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      <NewProjectModal
        open={showNewProjectModal}
        onOpenChange={setShowNewProjectModal}
        templates={templates}
        initialTemplateId={newFromTemplate}
        onCreated={(project) => setProjects((prev) => [...prev, project])}
      />
    </div>
  )
}
