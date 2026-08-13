import { prisma } from '@/lib/api/prisma'
import { withPrismaErrorMapping } from '@/lib/services/ServiceError'
import { STAGE_ORDER } from '@/types/Project'
import type {
  StageKey,
  StageStatus,
  ProjectListItem,
  ProjectDetail,
} from '@/types/Project'

const FIRST_STAGE_KEY = STAGE_ORDER[0]

// 7工程分のProjectStage行を、stageKeyをキーにしたステータスのマップへ変換する（未作成の工程はnot_started扱い）
function toStageStatuses(
  stages: { stageKey: StageKey; status: StageStatus }[]
): Record<StageKey, StageStatus> {
  return Object.fromEntries(
    STAGE_ORDER.map((stageKey) => [
      stageKey,
      stages.find((stage) => stage.stageKey === stageKey)?.status ??
        'not_started',
    ])
  ) as Record<StageKey, StageStatus>
}

// 案件一覧（7工程分のステータスサマリー付き）を取得する
export async function findProjectSummaries(
  organizationId: string
): Promise<ProjectListItem[]> {
  const projects = await withPrismaErrorMapping(() =>
    prisma.project.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      include: { stages: true },
    })
  )

  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    overallStatus: project.overallStatus,
    currentStage: project.currentStage,
    stageStatuses: toStageStatuses(project.stages),
    createdAt: project.createdAt.toISOString().slice(0, 10),
  }))
}

// 案件詳細（工程別ステータス一覧含む）を取得する
export async function findProjectDetailForOrg(
  organizationId: string,
  projectId: string
): Promise<ProjectDetail | null> {
  const project = await withPrismaErrorMapping(() =>
    prisma.project.findFirst({
      where: { id: projectId, organizationId },
      include: { stages: true },
    })
  )
  if (!project) return null

  return {
    id: project.id,
    name: project.name,
    overallStatus: project.overallStatus,
    currentStage: project.currentStage,
    stages: STAGE_ORDER.map((stageKey) => ({
      stageKey,
      status:
        project.stages.find((stage) => stage.stageKey === stageKey)?.status ??
        'not_started',
    })),
  }
}

// 同じ組織内で公開中のテンプレートを探す（案件作成時のtemplateId検証用。非公開・他組織のテンプレートはnull）
export async function findPublishedTemplateForOrg(
  organizationId: string,
  templateId: string
) {
  return withPrismaErrorMapping(() =>
    prisma.template.findFirst({
      where: { id: templateId, organizationId, publishedAt: { not: null } },
      select: { id: true },
    })
  )
}

// 案件を作成する（選択したテンプレートを参照する状態で、7工程分のレコードを一括作成する。工程1のみin_progress）
export async function insertProjectWithStages(payload: {
  organizationId: string
  name: string
  templateId: string
  createdBy: string
}): Promise<ProjectListItem> {
  const project = await withPrismaErrorMapping(() =>
    prisma.$transaction(async (tx) => {
      const created = await tx.project.create({
        data: {
          organizationId: payload.organizationId,
          name: payload.name,
          templateId: payload.templateId,
          createdBy: payload.createdBy,
        },
      })
      await tx.projectStage.createMany({
        data: STAGE_ORDER.map((stageKey) => ({
          projectId: created.id,
          stageKey,
          status: stageKey === FIRST_STAGE_KEY ? 'in_progress' : 'not_started',
        })),
      })
      return created
    })
  )

  return {
    id: project.id,
    name: project.name,
    overallStatus: project.overallStatus,
    currentStage: project.currentStage,
    stageStatuses: toStageStatuses(
      STAGE_ORDER.map((stageKey) => ({
        stageKey,
        status: stageKey === FIRST_STAGE_KEY ? 'in_progress' : 'not_started',
      }))
    ),
    createdAt: project.createdAt.toISOString().slice(0, 10),
  }
}

// このテンプレートを参照している案件が1件でも存在するかを確認する（テンプレート削除時の安全チェック用）
export async function hasProjectsReferencingTemplate(
  templateId: string
): Promise<boolean> {
  const count = await withPrismaErrorMapping(() =>
    prisma.project.count({ where: { templateId } })
  )
  return count > 0
}

// 指定テンプレートを参照している進行中の案件一覧を取得する（テンプレート編集時の影響確認用）
export async function findInProgressProjectsByTemplate(
  organizationId: string,
  templateId: string
): Promise<{ id: string; name: string }[]> {
  return withPrismaErrorMapping(() =>
    prisma.project.findMany({
      where: { organizationId, templateId, overallStatus: 'in_progress' },
      select: { id: true, name: true },
      orderBy: { createdAt: 'desc' },
    })
  )
}
