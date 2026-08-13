import { handleServiceError } from '@/utils/handleServiceError'
import { parseRequestBody } from '@/utils/parseRequestBody'
import { apiSuccess } from '@/lib/api/response'
import { stageTemplateSchema } from '@/schemas/stageTemplateSchema'
import { requireAdmin } from '@/lib/api/auth/requireAdmin'
import { getStageTemplate, updateStageTemplate } from '../../../service'

// テンプレート取得API（テンプレート名・質問セット・プロンプトテンプレート・品質ゲート項目・バージョン履歴。
// docs/README.md C2「GET/PUT /api/admin/templates/:templateId/stages/:stageKey」参照）
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ templateId: string; stageKey: string }> }
) {
  const { templateId, stageKey } = await params

  try {
    const user = await requireAdmin()
    return apiSuccess(
      await getStageTemplate(user.organizationId, templateId, stageKey)
    )
  } catch (error) {
    return handleServiceError(error)
  }
}

// テンプレート更新API（テンプレート名・指定工程の内容を新バージョンとして追記保存する。他工程の内容は直前バージョンから引き継ぐ）
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ templateId: string; stageKey: string }> }
) {
  const { templateId, stageKey } = await params

  try {
    const user = await requireAdmin()

    const parsed = await parseRequestBody(request, stageTemplateSchema)
    if (parsed.errorResponse) return parsed.errorResponse

    return apiSuccess(
      await updateStageTemplate(
        user.organizationId,
        user.id,
        templateId,
        stageKey,
        parsed.data
      )
    )
  } catch (error) {
    return handleServiceError(error)
  }
}
