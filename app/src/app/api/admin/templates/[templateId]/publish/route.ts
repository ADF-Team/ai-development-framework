import { handleServiceError } from '@/utils/handleServiceError'
import { apiSuccess } from '@/lib/api/response'
import { requireAdmin } from '@/lib/api/auth/requireAdmin'
import { publishTemplate } from '../../service'

// テンプレート公開API（templates.published_atを現在時刻に更新する。既に公開済みの場合は何もしない）
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const { templateId } = await params

  try {
    const user = await requireAdmin()
    return apiSuccess(await publishTemplate(user.organizationId, templateId))
  } catch (error) {
    return handleServiceError(error)
  }
}
