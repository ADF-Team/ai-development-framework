import { handleServiceError } from '@/utils/handleServiceError'
import { parseRequestBody } from '@/utils/parseRequestBody'
import { apiSuccess } from '@/lib/api/response'
import { createProjectSchema } from '@/schemas/createProjectSchema'
import { requireUser } from '@/lib/api/auth/requireUser'
import { getProjectList, createProject } from './service'

// 案件一覧取得API（docs/README.md C2「GET /api/projects」参照）
export async function GET() {
  try {
    const user = await requireUser()
    return apiSuccess({ projects: await getProjectList(user.organizationId) })
  } catch (error) {
    return handleServiceError(error)
  }
}

// 案件作成API（選択した公開テンプレートを参照する状態で、7工程分のレコードを一括作成する）
export async function POST(request: Request) {
  try {
    const user = await requireUser()

    const parsed = await parseRequestBody(request, createProjectSchema)
    if (parsed.errorResponse) return parsed.errorResponse

    return apiSuccess(
      await createProject(user.organizationId, user.id, parsed.data),
      { status: 201 }
    )
  } catch (error) {
    return handleServiceError(error)
  }
}
