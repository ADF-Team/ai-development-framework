import * as repository from './repository'
import { ServiceError } from '@/lib/services/ServiceError'
import { ERROR_STATUS } from '@/constants/response'
import { messages } from '@/constants/messages'
import { isStageKey, STAGE_ORDER } from '@/types/Project'
import type { StageKey, StageStatus } from '@/types/Project'
import type { StageDetail, StageQuestion } from '@/types/Stage'
import type { DeliverableData } from '@/types/Deliverable'

// 案件を組織スコープで取得する。存在しない・他組織の場合は404
async function findProjectOrThrow(organizationId: string, projectId: string) {
  const project = await repository.findProjectForOrg(organizationId, projectId)
  if (!project) {
    throw new ServiceError(
      ERROR_STATUS.NOT_FOUND,
      messages.common.errorMessage.notFound
    )
  }
  return project
}

// stageKeyが7工程マスタのいずれかに一致するか検証し、該当する案件×工程レコードを取得する
async function findStageOrThrow(projectId: string, stageKey: string) {
  if (!isStageKey(stageKey)) {
    throw new ServiceError(
      ERROR_STATUS.NOT_FOUND,
      messages.common.errorMessage.notFound
    )
  }
  const stage = await repository.findStageRow(projectId, stageKey)
  if (!stage) {
    throw new ServiceError(
      ERROR_STATUS.NOT_FOUND,
      messages.common.errorMessage.notFound
    )
  }
  return stage
}

// 質問への回答をプロンプトテンプレートに埋め込んでプロンプト文を組み立てる
function buildPrompt(
  stageKey: StageKey,
  questions: StageQuestion[],
  answers: Record<string, string>
): string {
  const stageName = messages.stages.stageNames[stageKey]
  const lines = [
    `あなたは${stageName}を担当する専門家です。以下のヒアリング回答をもとに、${stageName}工程の成果物を作成してください。`,
    '',
  ]
  questions.forEach((question, index) => {
    const answer = answers[question.id]
    if (answer) {
      lines.push(`${index + 1}. ${question.text}`, `→ ${answer}`, '')
    }
  })
  lines.push(
    '上記を踏まえ、実務で使えるレベルの成果物をMarkdown形式で出力してください。'
  )
  return lines.join('\n')
}

// 成果物データをレスポンス用の形に変換する
function toDeliverableData(
  deliverable: {
    id: string
    version: number
    content: string
    generationMethod: DeliverableData['generationMethod']
  } | null
): DeliverableData | null {
  if (!deliverable) return null
  return {
    id: deliverable.id,
    version: deliverable.version,
    content: deliverable.content,
    generationMethod: deliverable.generationMethod,
  }
}

/**
 * 特定工程の質問・回答・プロンプト・成果物・品質ゲート状況を取得する
 * @param organizationId - アクセス者の組織ID
 * @param projectId - 案件ID
 * @param stageKey - 工程キー
 */
export async function getStageDetail(
  organizationId: string,
  projectId: string,
  stageKey: string
): Promise<StageDetail> {
  const project = await findProjectOrThrow(organizationId, projectId)
  const stage = await findStageOrThrow(projectId, stageKey)
  const key = stage.stageKey as StageKey

  const content = await repository.findStageTemplateContent(
    project.templateId,
    key
  )
  if (!content) {
    throw new ServiceError(
      ERROR_STATUS.NOT_FOUND,
      messages.common.errorMessage.notFound
    )
  }

  return {
    stageKey: key,
    status: stage.status,
    questions: content.questions,
    answers: stage.answers as unknown as Record<string, string>,
    generatedPrompt: stage.generatedPrompt ?? '',
    deliverable: toDeliverableData(stage.deliverables[0] ?? null),
    qualityGateItems: content.qualityGateItems,
    qualityGateResult: stage.qualityGateResult as unknown as Record<
      string,
      { checked: boolean }
    >,
  }
}

/**
 * 工程の質問への回答を保存する（既存の回答へマージ。未着手からの初回保存でin_progressへ進む）
 * @param organizationId - アクセス者の組織ID
 * @param projectId - 案件ID
 * @param stageKey - 工程キー
 * @param answers - 質問ID→回答のマップ
 */
export async function saveStageAnswers(
  organizationId: string,
  projectId: string,
  stageKey: string,
  answers: Record<string, string>
): Promise<{ projectStageId: string; status: StageStatus }> {
  await findProjectOrThrow(organizationId, projectId)
  const stage = await findStageOrThrow(projectId, stageKey)

  const mergedAnswers = {
    ...(stage.answers as unknown as Record<string, string>),
    ...answers,
  }
  const hasAnswer = Object.values(mergedAnswers).some(
    (value) => value.trim() !== ''
  )
  const status: StageStatus =
    stage.status === 'not_started' && hasAnswer ? 'in_progress' : stage.status

  await repository.updateStageAnswers(stage.id, mergedAnswers, status)
  return { projectStageId: stage.id, status }
}

/**
 * 保存済みの回答をプロンプトテンプレートに埋め込み、プロンプトを生成する
 * @param organizationId - アクセス者の組織ID
 * @param projectId - 案件ID
 * @param stageKey - 工程キー
 */
export async function generateStagePrompt(
  organizationId: string,
  projectId: string,
  stageKey: string
): Promise<{ generatedPrompt: string }> {
  const project = await findProjectOrThrow(organizationId, projectId)
  const stage = await findStageOrThrow(projectId, stageKey)
  const key = stage.stageKey as StageKey
  const answers = stage.answers as unknown as Record<string, string>

  const hasAnswer = Object.values(answers).some((value) => value.trim() !== '')
  if (!hasAnswer) {
    throw new ServiceError(
      ERROR_STATUS.CONFLICT,
      messages.common.errorMessage.conflict
    )
  }

  const content = await repository.findStageTemplateContent(
    project.templateId,
    key
  )
  if (!content) {
    throw new ServiceError(
      ERROR_STATUS.NOT_FOUND,
      messages.common.errorMessage.notFound
    )
  }

  const generatedPrompt = buildPrompt(key, content.questions, answers)
  await repository.updateGeneratedPrompt(stage.id, generatedPrompt)
  return { generatedPrompt }
}

/**
 * 成果物を保存・編集する（プロンプトのみモードでの貼り付け／既存成果物の編集の両方に使用）
 * @param organizationId - アクセス者の組織ID
 * @param userId - 保存を行うユーザーのID
 * @param projectId - 案件ID
 * @param stageKey - 工程キー
 * @param content - 保存する成果物本文
 */
export async function saveDeliverable(
  organizationId: string,
  userId: string,
  projectId: string,
  stageKey: string,
  content: string
): Promise<{
  deliverableId: string
  version: number
  generationMethod: DeliverableData['generationMethod']
}> {
  await findProjectOrThrow(organizationId, projectId)
  const stage = await findStageOrThrow(projectId, stageKey)

  const deliverable = await repository.insertDeliverableVersion({
    projectStageId: stage.id,
    content,
    generationMethod: 'manual',
    updatedBy: userId,
  })

  return {
    deliverableId: deliverable.id,
    version: deliverable.version,
    generationMethod: deliverable.generationMethod,
  }
}

/**
 * 品質ゲートのチェック結果を保存し、通過判定・次工程への移行を行う
 * @param organizationId - アクセス者の組織ID
 * @param projectId - 案件ID
 * @param stageKey - 工程キー
 * @param checkedItemIds - チェック済みの品質ゲート項目ID一覧
 */
export async function submitQualityGate(
  organizationId: string,
  projectId: string,
  stageKey: string,
  checkedItemIds: string[]
): Promise<
  | { passed: true; nextStage: StageKey | null; projectCompleted: boolean }
  | { passed: false; missingItemIds: string[] }
> {
  const project = await findProjectOrThrow(organizationId, projectId)
  const stage = await findStageOrThrow(projectId, stageKey)
  const key = stage.stageKey as StageKey

  const content = await repository.findStageTemplateContent(
    project.templateId,
    key
  )
  if (!content) {
    throw new ServiceError(
      ERROR_STATUS.NOT_FOUND,
      messages.common.errorMessage.notFound
    )
  }

  const items = content.qualityGateItems
  const qualityGateResult = Object.fromEntries(
    items.map((item) => [item.id, { checked: checkedItemIds.includes(item.id) }])
  )
  const missingItemIds = items
    .filter((item) => !checkedItemIds.includes(item.id))
    .map((item) => item.id)
  const passed = missingItemIds.length === 0
  const nextStageKey = passed
    ? (STAGE_ORDER[STAGE_ORDER.indexOf(key) + 1] ?? null)
    : null

  const result = await repository.submitQualityGateResult({
    projectId,
    stageKey: key,
    qualityGateResult,
    passed,
    nextStageKey,
  })

  if (!passed) {
    return { passed: false, missingItemIds }
  }
  return {
    passed: true,
    nextStage: result.nextStage,
    projectCompleted: result.projectCompleted,
  }
}
