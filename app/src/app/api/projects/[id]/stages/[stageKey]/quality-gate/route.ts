import { handleServiceError } from '@/utils/handleServiceError'
import { parseRequestBody } from '@/utils/parseRequestBody'
import { apiSuccess } from '@/lib/api/response'
import { requireUser } from '@/lib/api/auth/requireUser'
import { postQualityGateSchema } from '@/schemas/api/postQualityGateSchema'
import { submitQualityGate } from '../service'

// 品質ゲート判定API（通過時は次工程へ移行。docs/README.md C2「POST /api/projects/:id/stages/:stageKey/quality-gate」参照）
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; stageKey: string }> }
) {
  const { id, stageKey } = await params

  try {
    const user = await requireUser()

    const parsed = await parseRequestBody(request, postQualityGateSchema)
    if (parsed.errorResponse) return parsed.errorResponse

    return apiSuccess(
      await submitQualityGate(
        user.organizationId,
        id,
        stageKey,
        parsed.data.checkedItemIds
      )
    )
  } catch (error) {
    return handleServiceError(error)
  }
}
