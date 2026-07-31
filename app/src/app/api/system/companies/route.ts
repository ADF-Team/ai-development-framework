import { NextResponse } from 'next/server'
import { handleServiceError } from '@/utils/handleServiceError'
import { createCompanySchema } from '@/schemas/createCompanySchema'
import { ERROR_STATUS } from '@/constants/response'
import { getCompanyList, registerCompany } from './service'

// TODO: インフラ（Cloud SQL）準備後、getCurrentUserによる認証チェック＋システム管理者ロール判定を追加する
// 会社（組織）一覧取得API（docs/README.md C2「GET /api/system/companies」参照）
export async function GET() {
  return NextResponse.json({ companies: getCompanyList() })
}

// 会社作成API（会社名＋初期管理者のメールアドレスを指定。作成と同時に初期管理者を招待する）
export async function POST(request: Request) {
  const body = await request.json()
  const parsed = createCompanySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { detail: parsed.error.issues[0].message },
      { status: ERROR_STATUS.UNPROCESSABLE_ENTITY }
    )
  }

  try {
    return NextResponse.json(registerCompany(parsed.data), { status: 201 })
  } catch (error) {
    return handleServiceError(error)
  }
}
