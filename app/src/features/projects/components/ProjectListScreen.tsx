'use client'

import { useAtomValue } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { projectsAtom } from '../stores/projectsAtom'
import { ProjectListHeader } from './ProjectListScreen/ProjectListHeader'
import { ProjectCard } from './ProjectListScreen/ProjectCard'
import type { ProjectListItem } from '@/types/Project'

// 案件一覧画面（/projects）のエントリーポイント
export function ProjectListScreen({
  initialProjects,
}: {
  initialProjects: ProjectListItem[]
}) {
  useHydrateAtoms([[projectsAtom, initialProjects]])
  const projects = useAtomValue(projectsAtom)

  return (
    <div className="mx-auto w-full max-w-300 flex-1 p-8">
      <ProjectListHeader />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}
