import { handleServiceError } from '@/utils/handleServiceError'
import { apiSuccess } from '@/lib/api/response'
import { requireUser } from '@/lib/api/auth/requireUser'
import { getProjectDetail } from '../service'

// 案件詳細取得API（docs/README.md C2「GET /api/projects/:id」参照）
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const user = await requireUser()
    return apiSuccess(await getProjectDetail(user.organizationId, id))
  } catch (error) {
    return handleServiceError(error)
  }
}
