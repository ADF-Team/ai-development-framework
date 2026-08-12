import { handleServiceError } from '@/utils/handleServiceError'
import { parseRequestBody } from '@/utils/parseRequestBody'
import { apiSuccess } from '@/lib/api/response'
import { updateCompanyDetail } from '../service'
import { updateCompanySchema } from '@/schemas/api/updateCompanySchema'
import { requireSystemAdmin } from '@/lib/api/auth/requireSystemAdmin'

// 会社名の変更・有効化／無効化API（docs/README.md C2「PATCH /api/system/companies/:id」参照）
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    await requireSystemAdmin()

    const parsed = await parseRequestBody(request, updateCompanySchema)
    if (parsed.errorResponse) return parsed.errorResponse

    return apiSuccess(await updateCompanyDetail(id, parsed.data))
  } catch (error) {
    return handleServiceError(error)
  }
}
