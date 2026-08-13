import { handleServiceError } from '@/utils/handleServiceError'
import { apiSuccess } from '@/lib/api/response'
import { requireUser } from '@/lib/api/auth/requireUser'
import { getPublishedTemplateDetail } from '../service'

// 公開テンプレート詳細取得API（現在有効な版の7工程分の内容。docs/README.md C2「GET /api/templates/published/:templateId」参照）
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const { templateId } = await params

  try {
    const user = await requireUser()
    return apiSuccess(
      await getPublishedTemplateDetail(user.organizationId, templateId)
    )
  } catch (error) {
    return handleServiceError(error)
  }
}
