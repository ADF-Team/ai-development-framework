import { handleServiceError } from '@/utils/handleServiceError'
import { parseRequestBody } from '@/utils/parseRequestBody'
import { apiSuccess } from '@/lib/api/response'
import { inviteUserSchema } from '@/schemas/inviteUserSchema'
import { requireAdmin } from '@/lib/api/auth/requireAdmin'
import { getUserList, inviteUser } from './service'

// 組織内メンバー一覧取得API（docs/README.md C2「GET /api/admin/users」参照）
export async function GET() {
  try {
    const user = await requireAdmin()
    return apiSuccess({ users: await getUserList(user.organizationId) })
  } catch (error) {
    return handleServiceError(error)
  }
}

// メンバー招待API（Identity Platform側のユーザー作成・招待メール送信は別途行う。docs/README.md C2「POST /api/admin/users」参照）
export async function POST(request: Request) {
  try {
    const user = await requireAdmin()

    const parsed = await parseRequestBody(request, inviteUserSchema)
    if (parsed.errorResponse) return parsed.errorResponse

    return apiSuccess(await inviteUser(user.organizationId, parsed.data), {
      status: 201,
    })
  } catch (error) {
    return handleServiceError(error)
  }
}
