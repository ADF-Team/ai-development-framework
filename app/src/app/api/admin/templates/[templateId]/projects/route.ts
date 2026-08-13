import { handleServiceError } from '@/utils/handleServiceError'
import { apiSuccess } from '@/lib/api/response'
import { requireAdmin } from '@/lib/api/auth/requireAdmin'
import { getProjectsUsingTemplate } from '../../service'

// テンプレート編集時の影響確認用：このテンプレートを参照している進行中の案件一覧取得API
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const { templateId } = await params

  try {
    const user = await requireAdmin()
    return apiSuccess({
      projects: await getProjectsUsingTemplate(user.organizationId, templateId),
    })
  } catch (error) {
    return handleServiceError(error)
  }
}
