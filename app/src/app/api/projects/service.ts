import * as repository from './repository'
import { ServiceError } from '@/lib/services/ServiceError'
import { ERROR_STATUS } from '@/constants/response'
import { messages } from '@/constants/messages'
import type { CreateProjectInput } from '@/schemas/createProjectSchema'

// 案件一覧を取得する
export function getProjectList(organizationId: string) {
  return repository.findProjectSummaries(organizationId)
}

// 案件を作成する（templateIdは同じ組織内で公開中のテンプレートである必要がある）
export async function createProject(
  organizationId: string,
  userId: string,
  input: CreateProjectInput
) {
  const template = await repository.findPublishedTemplateForOrg(
    organizationId,
    input.templateId
  )
  if (!template) {
    throw new ServiceError(
      ERROR_STATUS.NOT_FOUND,
      messages.common.errorMessage.notFound
    )
  }
  return repository.insertProjectWithStages({
    organizationId,
    name: input.name,
    templateId: input.templateId,
    createdBy: userId,
  })
}

// 案件詳細を取得する
export async function getProjectDetail(
  organizationId: string,
  projectId: string
) {
  const detail = await repository.findProjectDetailForOrg(
    organizationId,
    projectId
  )
  if (!detail) {
    throw new ServiceError(
      ERROR_STATUS.NOT_FOUND,
      messages.common.errorMessage.notFound
    )
  }
  return detail
}
