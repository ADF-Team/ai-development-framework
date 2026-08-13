import * as repository from './repository'
import { STAGE_ORDER, isStageKey } from '@/types/Project'
import { buildPromptTemplateFromQuestions } from '@/constants/templates'
import { ServiceError } from '@/lib/services/ServiceError'
import { ERROR_STATUS } from '@/constants/response'
import { messages } from '@/constants/messages'
import { NAME_MAX_LENGTH } from '@/constants/validation'
import type { StageKey } from '@/types/Project'
import type { NewTemplateInput } from '@/schemas/newTemplateSchema'
import type { StageTemplateInput } from '@/schemas/stageTemplateSchema'
import type { StageContent, StagesContent } from './repository'
import type {
  StageTemplateData,
  StageTemplateDetail,
} from '@/types/StageTemplate'

const COPY_TITLE_SUFFIX = 'のコピー'

// 7工程分、空の内容で初期化したステージ内容を組み立てる（新規テンプレート作成時用）
function buildEmptyStages(): StagesContent {
  return Object.fromEntries(
    STAGE_ORDER.map((stageKey): [StageKey, StageContent] => [
      stageKey,
      {
        questions: [],
        promptTemplate: buildPromptTemplateFromQuestions(stageKey, []),
        qualityGateItems: [],
      },
    ])
  ) as StagesContent
}

// 複製先テンプレートのタイトルを組み立てる（DBのVARCHAR(255)に収まるよう、必要なら元タイトルを切り詰める）
function buildCopyTitle(sourceTitle: string): string {
  const maxSourceLength = NAME_MAX_LENGTH - COPY_TITLE_SUFFIX.length
  const truncatedSource =
    sourceTitle.length > maxSourceLength
      ? sourceTitle.slice(0, maxSourceLength)
      : sourceTitle
  return `${truncatedSource}${COPY_TITLE_SUFFIX}`
}

function assertStageKey(stageKey: string): asserts stageKey is StageKey {
  if (!isStageKey(stageKey)) {
    throw new ServiceError(
      ERROR_STATUS.NOT_FOUND,
      messages.common.errorMessage.notFound
    )
  }
}

// バージョン番号（route paramsは文字列で渡ってくる）を検証する。不正な値は存在しないバージョンとして404にする
function assertVersionNumber(version: string): number {
  const parsed = Number(version)
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new ServiceError(
      ERROR_STATUS.NOT_FOUND,
      messages.common.errorMessage.notFound
    )
  }
  return parsed
}

async function requireTemplateForOrg(
  organizationId: string,
  templateId: string
) {
  const template = await repository.findTemplateForOrg(
    organizationId,
    templateId
  )
  if (!template) {
    throw new ServiceError(
      ERROR_STATUS.NOT_FOUND,
      messages.common.errorMessage.notFound
    )
  }
  return template
}

// 同じ組織内に同名（現在有効な版のタイトルが一致）のテンプレートが無いことを確認する
async function assertTitleAvailable(
  organizationId: string,
  title: string,
  excludeTemplateId?: string
) {
  const existingId = await repository.findTemplateIdByCurrentTitle(
    organizationId,
    title,
    excludeTemplateId
  )
  if (existingId) {
    throw new ServiceError(
      ERROR_STATUS.CONFLICT,
      messages.adminTemplates.validation.titleDuplicate
    )
  }
}

async function requireTemplateDetailForOrg(
  organizationId: string,
  templateId: string
) {
  const detail = await repository.findTemplateDetailForOrg(
    organizationId,
    templateId
  )
  if (!detail) {
    throw new ServiceError(
      ERROR_STATUS.NOT_FOUND,
      messages.common.errorMessage.notFound
    )
  }
  return detail
}

// テンプレート一覧を取得する（マイテンプレート一覧画面用）
export function getTemplateList(organizationId: string) {
  return repository.findTemplateSummaries(organizationId)
}

// 新規テンプレートを作成する（7工程とも空の内容で初期化される）
export async function createTemplate(
  organizationId: string,
  userId: string,
  input: NewTemplateInput
) {
  await assertTitleAvailable(organizationId, input.title)
  return repository.insertTemplateWithFirstVersion({
    organizationId,
    title: input.title,
    version: 1,
    createdBy: userId,
    stages: buildEmptyStages(),
  })
}

// テンプレートを複製する（現在有効な版の内容をコピーした新規テンプレートを作成する。バージョン履歴・IDは引き継がない）。
// 複製元が公開テンプレートの場合、複製先のsourcePublishedTemplateIdに複製元IDを記録する
export async function duplicateTemplate(
  organizationId: string,
  userId: string,
  templateId: string
) {
  const detail = await requireTemplateDetailForOrg(organizationId, templateId)
  const copyTitle = buildCopyTitle(detail.title)
  await assertTitleAvailable(organizationId, copyTitle)
  return repository.insertTemplateWithFirstVersion({
    organizationId,
    title: copyTitle,
    version: 1,
    createdBy: userId,
    stages: detail.stages,
    sourcePublishedTemplateId:
      detail.publishedAt !== null ? templateId : undefined,
  })
}

// テンプレートを削除する（バージョン履歴・7工程分の内容も含めて完全に削除される。取り消し不可）
export async function deleteTemplate(
  organizationId: string,
  templateId: string
) {
  await requireTemplateForOrg(organizationId, templateId)
  await repository.deleteTemplate(templateId)
}

// テンプレートを公開状態にする（既に公開済みの場合は何もせず、既存のpublishedAtをそのまま返す。冪等）
export async function publishTemplate(
  organizationId: string,
  templateId: string
) {
  const template = await requireTemplateForOrg(organizationId, templateId)
  if (template.publishedAt !== null) {
    return { id: template.id, publishedAt: template.publishedAt.toISOString() }
  }
  const updated = await repository.updatePublishState(templateId, new Date())
  return {
    id: updated.id,
    publishedAt: (updated.publishedAt as Date).toISOString(),
  }
}

// テンプレートを非公開状態に戻す（既に非公開の場合も同じ結果を返す。冪等）
export async function unpublishTemplate(
  organizationId: string,
  templateId: string
) {
  await requireTemplateForOrg(organizationId, templateId)
  const updated = await repository.updatePublishState(templateId, null)
  return { id: updated.id, publishedAt: updated.publishedAt }
}

// テンプレート名・特定工程の内容（現在有効な版）とバージョン履歴を取得する
export async function getStageTemplate(
  organizationId: string,
  templateId: string,
  stageKey: string
): Promise<StageTemplateDetail> {
  assertStageKey(stageKey)
  const detail = await requireTemplateDetailForOrg(organizationId, templateId)
  const versions = await repository.findVersionSummaries(templateId)
  const stage = detail.stages[stageKey]

  return {
    templateId,
    stageKey,
    title: detail.title,
    questions: stage.questions,
    promptTemplate: stage.promptTemplate,
    qualityGateItems: stage.qualityGateItems,
    version: detail.version,
    versions,
  }
}

// テンプレート名・特定工程の内容を新バージョンとして追記保存する（編集していない他の6工程は直前バージョンから引き継ぐ）。
// 「現在有効な版の取得」と「新バージョンの書き込み」を1トランザクションで行うrepository.appendVersionを使う
// ことで、複数管理者が同時に異なる工程を保存した場合の競合を防ぐ（詳細はrepository.ts参照）
export async function updateStageTemplate(
  organizationId: string,
  userId: string,
  templateId: string,
  stageKey: string,
  input: StageTemplateInput
): Promise<{ version: number }> {
  assertStageKey(stageKey)
  await assertTitleAvailable(organizationId, input.title, templateId)

  const result = await repository.appendVersion({
    organizationId,
    templateId,
    title: input.title,
    createdBy: userId,
    stageKey,
    stageContent: {
      questions: input.questions,
      promptTemplate: input.promptTemplate,
      qualityGateItems: input.qualityGateItems,
    },
  })
  if (!result) {
    throw new ServiceError(
      ERROR_STATUS.NOT_FOUND,
      messages.common.errorMessage.notFound
    )
  }
  return result
}

// テンプレートの特定バージョン・特定工程の内容を取得する（バージョン履歴の差分表示用）
export async function getStageTemplateVersion(
  organizationId: string,
  templateId: string,
  stageKey: string,
  version: string
): Promise<StageTemplateData> {
  assertStageKey(stageKey)
  const versionNumber = assertVersionNumber(version)
  const record = await repository.findVersionWithStages(
    organizationId,
    templateId,
    versionNumber
  )
  if (!record) {
    throw new ServiceError(
      ERROR_STATUS.NOT_FOUND,
      messages.common.errorMessage.notFound
    )
  }
  const stage = record.stages[stageKey]

  return {
    templateId,
    stageKey,
    title: record.title,
    questions: stage.questions,
    promptTemplate: stage.promptTemplate,
    qualityGateItems: stage.qualityGateItems,
    version: versionNumber,
  }
}
