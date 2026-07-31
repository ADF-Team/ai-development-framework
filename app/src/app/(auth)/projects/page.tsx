import { Suspense } from 'react'
import { getProjectList } from '@/lib/frontend/apiClient/projects/getProjectList'
import { getStageTemplateList } from '@/lib/frontend/apiClient/adminTemplates/getStageTemplateList'
import { ProjectListScreen } from '@/features/projects/components/ProjectListScreen'

// 案件一覧画面（/projects）
export default async function ProjectsPage() {
  const [projectsResponse, templatesResponse] = await Promise.all([
    getProjectList(),
    getStageTemplateList(),
  ])
  const projects =
    'projects' in projectsResponse ? projectsResponse.projects : []
  const templates =
    'templates' in templatesResponse ? templatesResponse.templates : []

  return (
    // ProjectListScreenがuseSearchParams()（?newFromTemplate=…の読み取り）を使うためSuspenseで包む
    <Suspense>
      <ProjectListScreen initialProjects={projects} templates={templates} />
    </Suspense>
  )
}
