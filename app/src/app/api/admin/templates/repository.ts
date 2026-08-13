import type {
  Prisma,
  PromptTemplate,
  QualityGateItem,
  QuestionTemplate,
  StageKey as PrismaStageKey,
} from '@prisma/client'
import { prisma } from '@/lib/api/prisma'
import { withPrismaErrorMapping } from '@/lib/services/ServiceError'
import { STAGE_ORDER } from '@/types/Project'
import type { StageKey } from '@/types/Project'
import type {
  TemplateQualityGateItem,
  TemplateQuestion,
  TemplateSummary,
  TemplateVersionSummary,
} from '@/types/StageTemplate'
import type { PublishedTemplateSummary } from '@/types/PublishedTemplate'

export interface StageContent {
  questions: TemplateQuestion[]
  promptTemplate: string
  qualityGateItems: TemplateQualityGateItem[]
}

export type StagesContent = Record<StageKey, StageContent>

type VersionWithStageRows = {
  id: string
  title: string
  version: number
  createdAt: Date
  creator: { displayName: string | null; email: string }
  questionTemplates: QuestionTemplate[]
  promptTemplates: PromptTemplate[]
  qualityGateItems: QualityGateItem[]
}

const LATEST_VERSION_INCLUDE = {
  orderBy: { version: 'desc' as const },
  take: 1,
  include: {
    creator: true,
    questionTemplates: true,
    promptTemplates: true,
    qualityGateItems: true,
  },
}

const LATEST_VERSION_STAGE_ROWS_INCLUDE = {
  orderBy: { version: 'desc' as const },
  take: 1,
  include: {
    questionTemplates: true,
    promptTemplates: true,
    qualityGateItems: true,
  },
}

// creator（User）のdisplayNameが未設定の場合はemailにフォールバックする
function creatorLabel(creator: {
  displayName: string | null
  email: string
}): string {
  return creator.displayName ?? creator.email
}

// 3つのステージ内容テーブル（question/prompt/qualityGate）の行群を、stageKeyをキーにしたStagesContentへ変換する
function toStagesContent(version: {
  questionTemplates: QuestionTemplate[]
  promptTemplates: PromptTemplate[]
  qualityGateItems: QualityGateItem[]
}): StagesContent {
  return Object.fromEntries(
    STAGE_ORDER.map((stageKey): [StageKey, StageContent] => {
      const questionRow = version.questionTemplates.find(
        (row) => row.stageKey === stageKey
      )
      const promptRow = version.promptTemplates.find(
        (row) => row.stageKey === stageKey
      )
      const qualityGateRow = version.qualityGateItems.find(
        (row) => row.stageKey === stageKey
      )
      return [
        stageKey,
        {
          questions: (questionRow?.questions ??
            []) as unknown as TemplateQuestion[],
          promptTemplate: promptRow?.templateText ?? '',
          qualityGateItems: (qualityGateRow?.items ??
            []) as unknown as TemplateQualityGateItem[],
        },
      ]
    })
  ) as StagesContent
}

// テンプレート一覧（マイテンプレート一覧画面用）を取得する
export async function findTemplateSummaries(
  organizationId: string
): Promise<TemplateSummary[]> {
  const templates = await withPrismaErrorMapping(() =>
    prisma.template.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      include: {
        versions: LATEST_VERSION_INCLUDE,
        _count: { select: { versions: true } },
      },
    })
  )

  return templates.map((template) => {
    const current = template.versions[0]
    return {
      id: template.id,
      title: current.title,
      version: current.version,
      updatedAt: current.createdAt.toISOString().slice(0, 10),
      updatedBy: creatorLabel(current.creator),
      isPublished: template.publishedAt !== null,
      showPublishedTag:
        template.sourcePublishedTemplateId !== null &&
        template._count.versions === 1,
    }
  })
}

// テンプレート（存在確認・組織スコープ確認用の軽量版。バージョン内容は含まない）を取得する
export async function findTemplateForOrg(
  organizationId: string,
  templateId: string
) {
  return withPrismaErrorMapping(() =>
    prisma.template.findFirst({ where: { id: templateId, organizationId } })
  )
}

// 同じ組織内で、現在のタイトル（Template.title。非正規化カラム）が一致する他のテンプレートのIDを探す（名前重複チェック用の早期リターン）。
// excludeTemplateIdを指定すると、そのテンプレート自身は対象から除外する（リネーム時に自分自身とは衝突させないため）。
// 実際の重複禁止はDBの一意制約（organizationId, title）で保証されるため、これは高速な事前チェックに過ぎない
export async function findTemplateIdByCurrentTitle(
  organizationId: string,
  title: string,
  excludeTemplateId?: string
): Promise<string | null> {
  const template = await withPrismaErrorMapping(() =>
    prisma.template.findFirst({
      where: {
        organizationId,
        title,
        ...(excludeTemplateId ? { id: { not: excludeTemplateId } } : {}),
      },
      select: { id: true },
    })
  )
  return template?.id ?? null
}

// テンプレート＋現在有効な版（7工程分の内容込み）を取得する
export async function findTemplateDetailForOrg(
  organizationId: string,
  templateId: string
) {
  const template = await withPrismaErrorMapping(() =>
    prisma.template.findFirst({
      where: { id: templateId, organizationId },
      include: { versions: LATEST_VERSION_INCLUDE },
    })
  )
  if (!template || template.versions.length === 0) return null

  const current = template.versions[0] as VersionWithStageRows
  return {
    publishedAt: template.publishedAt,
    sourcePublishedTemplateId: template.sourcePublishedTemplateId,
    version: current.version,
    title: current.title,
    stages: toStagesContent(current),
  }
}

// テンプレートのバージョン履歴一覧（新しい順）を取得する
export async function findVersionSummaries(
  templateId: string
): Promise<TemplateVersionSummary[]> {
  const versions = await withPrismaErrorMapping(() =>
    prisma.templateVersion.findMany({
      where: { templateId },
      orderBy: { version: 'desc' },
      include: { creator: true },
    })
  )
  return versions.map((version) => ({
    version: version.version,
    createdAt: version.createdAt.toISOString().slice(0, 10),
    createdBy: creatorLabel(version.creator),
  }))
}

// テンプレートの特定バージョン・7工程分の内容を取得する（バージョン差分表示用）
export async function findVersionWithStages(
  organizationId: string,
  templateId: string,
  version: number
) {
  const record = await withPrismaErrorMapping(() =>
    prisma.templateVersion.findFirst({
      where: { version, template: { id: templateId, organizationId } },
      include: {
        questionTemplates: true,
        promptTemplates: true,
        qualityGateItems: true,
      },
    })
  )
  if (!record) return null
  return { title: record.title, stages: toStagesContent(record) }
}

// 1つの版（テンプレートバージョン＋7工程分のquestion/prompt/qualityGate行）をトランザクション内に作成する
async function insertVersionInTransaction(
  tx: Prisma.TransactionClient,
  payload: {
    templateId: string
    title: string
    version: number
    createdBy: string
    stages: StagesContent
  }
) {
  const templateVersion = await tx.templateVersion.create({
    data: {
      templateId: payload.templateId,
      title: payload.title,
      version: payload.version,
      createdBy: payload.createdBy,
    },
  })

  const stageKeys = STAGE_ORDER as PrismaStageKey[]

  // 3テーブルとも互いに独立した書き込みのため並行実行する
  await Promise.all([
    tx.questionTemplate.createMany({
      data: stageKeys.map((stageKey) => ({
        templateVersionId: templateVersion.id,
        stageKey,
        questions: payload.stages[stageKey as StageKey]
          .questions as unknown as Prisma.InputJsonValue,
      })),
    }),
    tx.promptTemplate.createMany({
      data: stageKeys.map((stageKey) => ({
        templateVersionId: templateVersion.id,
        stageKey,
        templateText: payload.stages[stageKey as StageKey].promptTemplate,
      })),
    }),
    tx.qualityGateItem.createMany({
      data: stageKeys.map((stageKey) => ({
        templateVersionId: templateVersion.id,
        stageKey,
        items: payload.stages[stageKey as StageKey]
          .qualityGateItems as unknown as Prisma.InputJsonValue,
      })),
    }),
  ])

  return templateVersion
}

// 新規テンプレート（Template＋最初の版）を作成する。versionは常に1（呼び出し元のservice.tsが決定して渡す）
export async function insertTemplateWithFirstVersion(payload: {
  organizationId: string
  title: string
  version: number
  createdBy: string
  stages: StagesContent
  sourcePublishedTemplateId?: string
}): Promise<{ id: string; version: number }> {
  const template = await withPrismaErrorMapping(() =>
    prisma.$transaction(async (tx) => {
      const created = await tx.template.create({
        data: {
          organizationId: payload.organizationId,
          title: payload.title,
          sourcePublishedTemplateId: payload.sourcePublishedTemplateId ?? null,
        },
      })
      await insertVersionInTransaction(tx, {
        templateId: created.id,
        title: payload.title,
        version: payload.version,
        createdBy: payload.createdBy,
        stages: payload.stages,
      })
      return created
    })
  )
  return { id: template.id, version: payload.version }
}

// 既存テンプレートに新しい版を追記する。「現在有効な版の取得（他の6工程の内容引き継ぎ元）」と
// 「新バージョンの書き込み」を同一トランザクション内で行うことで、複数管理者が同時に異なる工程を
// 保存した場合でも、片方の変更が新しいバージョンにサイレントに消し飛ばされる（読み取ってから書くまでの
// 間に他方の保存が割り込む）レースコンディションを防ぐ。存在しない・他組織のテンプレートの場合はnull
export async function appendVersion(payload: {
  organizationId: string
  templateId: string
  title: string
  createdBy: string
  stageKey: StageKey
  stageContent: StageContent
}): Promise<{ version: number } | null> {
  return withPrismaErrorMapping(() =>
    prisma.$transaction(async (tx) => {
      const latest = await tx.templateVersion.findFirst({
        where: {
          templateId: payload.templateId,
          template: { organizationId: payload.organizationId },
        },
        ...LATEST_VERSION_STAGE_ROWS_INCLUDE,
      })
      if (!latest) return null

      const stages: StagesContent = {
        ...toStagesContent(latest),
        [payload.stageKey]: payload.stageContent,
      }

      const created = await insertVersionInTransaction(tx, {
        templateId: payload.templateId,
        title: payload.title,
        version: latest.version + 1,
        createdBy: payload.createdBy,
        stages,
      })
      // Template.title（非正規化カラム）も同一トランザクション内で同期させる。
      // 重複時はここでDBの一意制約違反（P2002）が発生し、withPrismaErrorMappingが409に変換する
      await tx.template.update({
        where: { id: payload.templateId },
        data: { title: payload.title },
      })
      return { version: created.version }
    })
  )
}

// テンプレートの公開状態（published_at）を更新する
export async function updatePublishState(
  templateId: string,
  publishedAt: Date | null
): Promise<{ id: string; publishedAt: Date | null }> {
  const template = await withPrismaErrorMapping(() =>
    prisma.template.update({ where: { id: templateId }, data: { publishedAt } })
  )
  return { id: template.id, publishedAt: template.publishedAt }
}

// 公開中テンプレートの一覧を取得する
export async function findPublishedTemplateSummaries(
  organizationId: string
): Promise<PublishedTemplateSummary[]> {
  const templates = await withPrismaErrorMapping(() =>
    prisma.template.findMany({
      where: { organizationId, publishedAt: { not: null } },
      orderBy: { publishedAt: 'desc' },
      include: { versions: LATEST_VERSION_INCLUDE },
    })
  )
  return templates
    .filter((template) => template.versions.length > 0)
    .map((template) => ({
      id: template.id,
      title: template.versions[0].title,
      version: template.versions[0].version,
      // publishedAtはnullを絞り込み済みなのでnon-null
      publishedAt: (template.publishedAt as Date).toISOString(),
    }))
}

// 公開テンプレートの詳細（現在有効な版の7工程分の内容）を取得する。非公開の場合はnull
export async function findPublishedTemplateDetail(
  organizationId: string,
  templateId: string
) {
  const template = await withPrismaErrorMapping(() =>
    prisma.template.findFirst({
      where: { id: templateId, organizationId, publishedAt: { not: null } },
      include: { versions: LATEST_VERSION_INCLUDE },
    })
  )
  if (!template || template.versions.length === 0) return null

  const current = template.versions[0] as VersionWithStageRows
  return {
    id: template.id,
    title: current.title,
    version: current.version,
    publishedAt: (template.publishedAt as Date).toISOString(),
    stages: toStagesContent(current),
  }
}

// テンプレートを削除する（バージョン履歴・7工程分の内容もカスケード削除される。schema.prismaのonDelete: Cascade参照）。
// このテンプレートを複製元として参照している他のテンプレートは、削除されずsourcePublishedTemplateIdがnullになるだけ（onDelete: SetNull）
export async function deleteTemplate(templateId: string): Promise<void> {
  await withPrismaErrorMapping(() =>
    prisma.template.delete({ where: { id: templateId } })
  )
}
