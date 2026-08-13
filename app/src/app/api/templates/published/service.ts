import * as repository from './repository'
import { STAGE_ORDER } from '@/types/Project'
import { ServiceError } from '@/lib/services/ServiceError'
import { ERROR_STATUS } from '@/constants/response'
import { messages } from '@/constants/messages'
import type { PublishedTemplateDetail } from '@/types/PublishedTemplate'

// 公開テンプレート一覧を取得する
export function getPublishedTemplateList(organizationId: string) {
  return repository.findPublishedTemplates(organizationId)
}

// 公開テンプレートの詳細を取得する。非公開・存在しない場合は404
export async function getPublishedTemplateDetail(
  organizationId: string,
  templateId: string
): Promise<PublishedTemplateDetail> {
  const detail = await repository.findPublishedTemplateDetail(
    organizationId,
    templateId
  )
  if (!detail) {
    throw new ServiceError(
      ERROR_STATUS.NOT_FOUND,
      messages.common.errorMessage.notFound
    )
  }
  return {
    id: detail.id,
    title: detail.title,
    version: detail.version,
    publishedAt: detail.publishedAt,
    stages: STAGE_ORDER.map((stageKey) => ({
      stageKey,
      questions: detail.stages[stageKey].questions,
      promptTemplate: detail.stages[stageKey].promptTemplate,
      qualityGateItems: detail.stages[stageKey].qualityGateItems,
    })),
  }
}
