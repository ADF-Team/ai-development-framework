import { handleServiceError } from '@/utils/handleServiceError'
import { apiSuccess } from '@/lib/api/response'
import { requireUser } from '@/lib/api/auth/requireUser'
import { generateStagePrompt } from '../service'

// プロンプト生成API（保存済みanswersを使用。docs/README.md C2「POST /api/projects/:id/stages/:stageKey/generate-prompt」参照）
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string; stageKey: string }> }
) {
  const { id, stageKey } = await params

  try {
    const user = await requireUser()
    return apiSuccess(
      await generateStagePrompt(user.organizationId, id, stageKey)
    )
  } catch (error) {
    return handleServiceError(error)
  }
}
