import type { Prisma, DeliverableGenerationMethod } from '@prisma/client'
import { prisma } from '@/lib/api/prisma'
import { withPrismaErrorMapping } from '@/lib/services/ServiceError'
import type { StageKey, StageStatus } from '@/types/Project'
import type { StageQuestion, QualityGateItem } from '@/types/Stage'

export interface StageTemplateContent {
  questions: StageQuestion[]
  promptTemplate: string
  qualityGateItems: QualityGateItem[]
}

// 案件を組織スコープで取得する（存在確認・参照テンプレートID取得用）
export async function findProjectForOrg(
  organizationId: string,
  projectId: string
) {
  return withPrismaErrorMapping(() =>
    prisma.project.findFirst({
      where: { id: projectId, organizationId },
      select: { id: true, templateId: true },
    })
  )
}

// 案件×工程の1レコードを、最新の成果物付きで取得する
export async function findStageRow(projectId: string, stageKey: StageKey) {
  return withPrismaErrorMapping(() =>
    prisma.projectStage.findUnique({
      where: { projectId_stageKey: { projectId, stageKey } },
      include: { deliverables: { orderBy: { version: 'desc' }, take: 1 } },
    })
  )
}

// 案件が参照するテンプレートの現在有効な版から、指定工程の質問セット・プロンプトテンプレート・
// 品質ゲート項目を取得する（テンプレート編集は既存案件にも反映されるライブ参照）
export async function findStageTemplateContent(
  templateId: string,
  stageKey: StageKey
): Promise<StageTemplateContent | null> {
  const latestVersion = await withPrismaErrorMapping(() =>
    prisma.templateVersion.findFirst({
      where: { templateId },
      orderBy: { version: 'desc' },
      include: {
        questionTemplates: { where: { stageKey } },
        promptTemplates: { where: { stageKey } },
        qualityGateItems: { where: { stageKey } },
      },
    })
  )
  if (!latestVersion) return null

  return {
    questions: (latestVersion.questionTemplates[0]?.questions ??
      []) as unknown as StageQuestion[],
    promptTemplate: latestVersion.promptTemplates[0]?.templateText ?? '',
    qualityGateItems: (latestVersion.qualityGateItems[0]?.items ??
      []) as unknown as QualityGateItem[],
  }
}

// 質問への回答を保存し、必要に応じて工程ステータスをin_progressへ進める
export async function updateStageAnswers(
  projectStageId: string,
  answers: Record<string, string>,
  status: StageStatus
) {
  return withPrismaErrorMapping(() =>
    prisma.projectStage.update({
      where: { id: projectStageId },
      data: {
        answers: answers as unknown as Prisma.InputJsonValue,
        status,
      },
    })
  )
}

// 生成したプロンプトを保存する
export async function updateGeneratedPrompt(
  projectStageId: string,
  generatedPrompt: string
) {
  return withPrismaErrorMapping(() =>
    prisma.projectStage.update({
      where: { id: projectStageId },
      data: { generatedPrompt },
    })
  )
}

// 成果物の新版を追記し、必要に応じて工程ステータスをquality_gate_pendingへ進める。
// 「現在の最新版番号・工程ステータスの取得」と「新版の書き込み・ステータス更新」を同一トランザクション内で行うことで、
// 同時保存によるバージョン番号の衝突・ステータス更新の取りこぼしを防ぐ
export async function insertDeliverableVersion(payload: {
  projectStageId: string
  content: string
  generationMethod: DeliverableGenerationMethod
  updatedBy: string
}) {
  return withPrismaErrorMapping(() =>
    prisma.$transaction(async (tx) => {
      const stage = await tx.projectStage.findUniqueOrThrow({
        where: { id: payload.projectStageId },
      })
      const latestDeliverable = await tx.deliverable.findFirst({
        where: { projectStageId: payload.projectStageId },
        orderBy: { version: 'desc' },
      })
      const version = (latestDeliverable?.version ?? 0) + 1

      const deliverable = await tx.deliverable.create({
        data: {
          projectStageId: payload.projectStageId,
          content: payload.content,
          generationMethod: payload.generationMethod,
          version,
          updatedBy: payload.updatedBy,
        },
      })

      if (stage.status === 'in_progress' || stage.status === 'not_started') {
        await tx.projectStage.update({
          where: { id: payload.projectStageId },
          data: { status: 'quality_gate_pending' },
        })
      }

      return deliverable
    })
  )
}

interface QualityGateSubmitResult {
  nextStage: StageKey | null
  projectCompleted: boolean
}

// 品質ゲートのチェック結果を保存する。通過時は工程を完了させ、次工程を開始・案件を完了状態にする（同一トランザクション）。
// nextStageKeyは呼び出し元（service.ts）が7工程マスタの並び順から決定済みの値を渡す（DBの現在の状態に依存しない
// 純粋な決定のため、repository.tsでは判断せずデータとして受け取る。app/CLAUDE.md「API実装」参照）
export async function submitQualityGateResult(payload: {
  projectId: string
  stageKey: StageKey
  qualityGateResult: Record<string, { checked: boolean }>
  passed: boolean
  nextStageKey: StageKey | null
}): Promise<QualityGateSubmitResult> {
  return withPrismaErrorMapping(() =>
    prisma.$transaction(async (tx) => {
      if (!payload.passed) {
        await tx.projectStage.update({
          where: {
            projectId_stageKey: {
              projectId: payload.projectId,
              stageKey: payload.stageKey,
            },
          },
          data: {
            qualityGateResult:
              payload.qualityGateResult as unknown as Prisma.InputJsonValue,
          },
        })
        return { nextStage: null, projectCompleted: false }
      }

      await tx.projectStage.update({
        where: {
          projectId_stageKey: {
            projectId: payload.projectId,
            stageKey: payload.stageKey,
          },
        },
        data: {
          qualityGateResult:
            payload.qualityGateResult as unknown as Prisma.InputJsonValue,
          status: 'completed',
          completedAt: new Date(),
        },
      })

      if (payload.nextStageKey) {
        const nextStage = await tx.projectStage.findUniqueOrThrow({
          where: {
            projectId_stageKey: {
              projectId: payload.projectId,
              stageKey: payload.nextStageKey,
            },
          },
        })
        if (nextStage.status === 'not_started') {
          await tx.projectStage.update({
            where: { id: nextStage.id },
            data: { status: 'in_progress' },
          })
        }
        await tx.project.update({
          where: { id: payload.projectId },
          data: { currentStage: payload.nextStageKey },
        })
        return { nextStage: payload.nextStageKey, projectCompleted: false }
      }

      await tx.project.update({
        where: { id: payload.projectId },
        data: { overallStatus: 'completed' },
      })
      return { nextStage: null, projectCompleted: true }
    })
  )
}
