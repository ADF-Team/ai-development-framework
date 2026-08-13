import { handleServiceError } from '@/utils/handleServiceError'
import { parseRequestBody } from '@/utils/parseRequestBody'
import { apiSuccess } from '@/lib/api/response'
import { updateUserSchema } from '@/schemas/api/updateUserSchema'
import { requireAdmin } from '@/lib/api/auth/requireAdmin'
import { updateUser } from '../service'

// メンバーのロール変更／アカウント無効化・再有効化API（docs/README.md C2「PATCH /api/admin/users/:id」参照）
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const user = await requireAdmin()

    const parsed = await parseRequestBody(request, updateUserSchema)
    if (parsed.errorResponse) return parsed.errorResponse

    return apiSuccess(await updateUser(user.organizationId, id, parsed.data))
  } catch (error) {
    return handleServiceError(error)
  }
}
