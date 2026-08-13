import { handleServiceError } from '@/utils/handleServiceError'
import { apiSuccess } from '@/lib/api/response'
import { requireAdmin } from '@/lib/api/auth/requireAdmin'
import { duplicateTemplate } from '../../service'

// テンプレート複製API（現在有効な版の内容をコピーした新規テンプレートを作成する）
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const { templateId } = await params

  try {
    const user = await requireAdmin()
    return apiSuccess(
      await duplicateTemplate(user.organizationId, user.id, templateId),
      { status: 201 }
    )
  } catch (error) {
    return handleServiceError(error)
  }
}
