import { handleServiceError } from '@/utils/handleServiceError'
import { parseRequestBody } from '@/utils/parseRequestBody'
import { apiSuccess } from '@/lib/api/response'
import { createCompanySchema } from '@/schemas/createCompanySchema'
import { requireSystemAdmin } from '@/lib/api/auth/requireSystemAdmin'
import { getCompanyList, registerCompany } from './service'

// 会社（組織）一覧取得API（docs/README.md C2「GET /api/system/companies」参照）
export async function GET() {
  try {
    await requireSystemAdmin()
    return apiSuccess({ companies: await getCompanyList() })
  } catch (error) {
    return handleServiceError(error)
  }
}

// 会社作成API（会社名＋初期管理者のメールアドレスを指定。作成と同時に初期管理者を招待する）
export async function POST(request: Request) {
  try {
    await requireSystemAdmin()

    const parsed = await parseRequestBody(request, createCompanySchema)
    if (parsed.errorResponse) return parsed.errorResponse

    return apiSuccess(await registerCompany(parsed.data), { status: 201 })
  } catch (error) {
    return handleServiceError(error)
  }
}
