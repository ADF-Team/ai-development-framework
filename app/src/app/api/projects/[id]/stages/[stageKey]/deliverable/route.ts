import { handleServiceError } from '@/utils/handleServiceError'
import { parseRequestBody } from '@/utils/parseRequestBody'
import { apiSuccess } from '@/lib/api/response'
import { requireUser } from '@/lib/api/auth/requireUser'
import { deliverableContentFormSchema } from '@/schemas/deliverableContentFormSchema'
import { saveDeliverable } from '../service'

// 成果物保存API（プロンプトのみモードでの貼り付け・既存成果物の編集の両方に使用。docs/README.md C2「PATCH /api/projects/:id/stages/:stageKey/deliverable」参照）
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; stageKey: string }> }
) {
  const { id, stageKey } = await params

  try {
    const user = await requireUser()

    const parsed = await parseRequestBody(request, deliverableContentFormSchema)
    if (parsed.errorResponse) return parsed.errorResponse

    return apiSuccess(
      await saveDeliverable(
        user.organizationId,
        user.id,
        id,
        stageKey,
        parsed.data.content
      )
    )
  } catch (error) {
    return handleServiceError(error)
  }
}
