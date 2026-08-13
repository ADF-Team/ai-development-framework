import { handleServiceError } from '@/utils/handleServiceError'
import { apiSuccess } from '@/lib/api/response'
import { requireAdmin } from '@/lib/api/auth/requireAdmin'
import { unpublishTemplate } from '../../service'

// テンプレート非公開API（templates.published_atをnullに戻す。既に非公開の場合も同様に冪等）
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const { templateId } = await params

  try {
    const user = await requireAdmin()
    return apiSuccess(await unpublishTemplate(user.organizationId, templateId))
  } catch (error) {
    return handleServiceError(error)
  }
}
