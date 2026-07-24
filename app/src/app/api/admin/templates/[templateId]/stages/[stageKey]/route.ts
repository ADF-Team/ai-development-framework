import { NextResponse } from 'next/server'
import { getStageTemplate, updateStageTemplate } from '@/lib/services/templates'
import { handleServiceError } from '@/utils/handleServiceError'
import type {
  TemplateQuestion,
  TemplateQualityGateItem,
} from '@/types/StageTemplate'

// TODO: インフラ（Cloud SQL）準備後、getCurrentUserによる認証チェック＋管理者ロール判定を追加する
// テンプレート取得API（テンプレート名・質問セット・プロンプトテンプレート・品質ゲート項目・バージョン履歴。docs/README.md C2「GET/PUT /api/admin/templates/:templateId/stages/:stageKey」参照）
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ templateId: string; stageKey: string }> }
) {
  const { templateId, stageKey } = await params
  try {
    return NextResponse.json(getStageTemplate(templateId, stageKey))
  } catch (error) {
    return handleServiceError(error)
  }
}

interface PutTemplateBody {
  title: string
  questions: TemplateQuestion[]
  promptTemplate: string
  qualityGateItems: TemplateQualityGateItem[]
}

// テンプレート更新API（テンプレート名・指定工程の内容を新バージョンとして追記保存する。他工程の内容は直前バージョンから引き継ぐ）
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ templateId: string; stageKey: string }> }
) {
  const { templateId, stageKey } = await params
  const body = (await request.json()) as PutTemplateBody
  try {
    return NextResponse.json(updateStageTemplate(templateId, stageKey, body))
  } catch (error) {
    return handleServiceError(error)
  }
}
