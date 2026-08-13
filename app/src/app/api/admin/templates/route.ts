import { handleServiceError } from '@/utils/handleServiceError'
import { parseRequestBody } from '@/utils/parseRequestBody'
import { apiSuccess } from '@/lib/api/response'
import { newTemplateSchema } from '@/schemas/newTemplateSchema'
import { requireAdmin } from '@/lib/api/auth/requireAdmin'
import { getTemplateList, createTemplate } from './service'

// マイテンプレート一覧取得API（docs/README.md C2「GET /api/admin/templates」参照）
export async function GET() {
  try {
    const user = await requireAdmin()
    return apiSuccess({ templates: await getTemplateList(user.organizationId) })
  } catch (error) {
    return handleServiceError(error)
  }
}

// テンプレート新規作成API（7工程とも空の内容で初期化される）
export async function POST(request: Request) {
  try {
    const user = await requireAdmin()

    const parsed = await parseRequestBody(request, newTemplateSchema)
    if (parsed.errorResponse) return parsed.errorResponse

    return apiSuccess(
      await createTemplate(user.organizationId, user.id, parsed.data),
      { status: 201 }
    )
  } catch (error) {
    return handleServiceError(error)
  }
}
