import { handleServiceError } from '@/utils/handleServiceError'
import { parseRequestBody } from '@/utils/parseRequestBody'
import { apiSuccess } from '@/lib/api/response'
import { requireUser } from '@/lib/api/auth/requireUser'
import { postStageAnswersSchema } from '@/schemas/api/postStageAnswersSchema'
import { saveStageAnswers } from '../service'

// 質問への回答保存API（docs/README.md C2「POST /api/projects/:id/stages/:stageKey/answers」参照）
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; stageKey: string }> }
) {
  const { id, stageKey } = await params

  try {
    const user = await requireUser()

    const parsed = await parseRequestBody(request, postStageAnswersSchema)
    if (parsed.errorResponse) return parsed.errorResponse

    return apiSuccess(
      await saveStageAnswers(
        user.organizationId,
        id,
        stageKey,
        parsed.data.answers
      )
    )
  } catch (error) {
    return handleServiceError(error)
  }
}
