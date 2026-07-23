import { notFound } from 'next/navigation'
import { getProject } from '@/lib/api/projects/getProject'
import { getStage } from '@/lib/api/stages/getStage'
import { StageWorkspace } from '@/features/stages/components/StageWorkspace'

// 案件詳細画面（工程別進行画面。/projects/[projectId]）
export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params

  const project = await getProject(projectId)
  if ('error' in project) {
    notFound()
  }

  const stage = await getStage(projectId, project.currentStage)
  if ('error' in stage) {
    notFound()
  }

  return (
    <StageWorkspace
      projectId={projectId}
      initialProject={project}
      initialStage={stage}
    />
  )
}
