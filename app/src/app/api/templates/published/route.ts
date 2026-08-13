import { handleServiceError } from '@/utils/handleServiceError'
import { apiSuccess } from '@/lib/api/response'
import { requireUser } from '@/lib/api/auth/requireUser'
import { getPublishedTemplateList } from './service'

// 公開テンプレート一覧取得API（docs/README.md C2「GET /api/templates/published」参照）
export async function GET() {
  try {
    const user = await requireUser()
    return apiSuccess({
      templates: await getPublishedTemplateList(user.organizationId),
    })
  } catch (error) {
    return handleServiceError(error)
  }
}
