import { handleServiceError } from '@/utils/handleServiceError'
import { apiSuccess } from '@/lib/api/response'
import { requireUser } from '@/lib/api/auth/requireUser'
import { getStageDetail } from './service'

// 工程詳細取得API（質問・回答・プロンプト・成果物・品質ゲート状況。docs/README.md C2「GET /api/projects/:id/stages/:stageKey」参照）
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; stageKey: string }> }
) {
  const { id, stageKey } = await params

  try {
    const user = await requireUser()
    return apiSuccess(await getStageDetail(user.organizationId, id, stageKey))
  } catch (error) {
    return handleServiceError(error)
  }
}
