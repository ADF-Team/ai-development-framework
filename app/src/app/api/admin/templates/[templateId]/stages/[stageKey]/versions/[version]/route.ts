import { handleServiceError } from '@/utils/handleServiceError'
import { apiSuccess } from '@/lib/api/response'
import { requireAdmin } from '@/lib/api/auth/requireAdmin'
import { getStageTemplateVersion } from '../../../../../service'

// テンプレートの特定バージョン・指定工程の内容取得API（バージョン履歴の差分表示用）
export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ templateId: string; stageKey: string; version: string }>
  }
) {
  const { templateId, stageKey, version } = await params

  try {
    const user = await requireAdmin()
    return apiSuccess(
      await getStageTemplateVersion(
        user.organizationId,
        templateId,
        stageKey,
        version
      )
    )
  } catch (error) {
    return handleServiceError(error)
  }
}
