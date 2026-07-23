import { getProjectList } from '@/lib/api/projects/getProjectList'
import { ProjectListScreen } from '@/features/projects/components/ProjectListScreen'

// 案件一覧画面（/projects）
export default async function ProjectsPage() {
  const response = await getProjectList()
  const projects = 'projects' in response ? response.projects : []

  return <ProjectListScreen initialProjects={projects} />
}
