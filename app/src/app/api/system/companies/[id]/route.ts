import { NextResponse } from 'next/server'
import { handleServiceError } from '@/utils/handleServiceError'
import { updateCompanyDetail } from '../service'
import type { CompanyStatus } from '@/types/Company'

interface PatchCompanyBody {
  name?: string
  status?: CompanyStatus
}

// TODO: インフラ（Cloud SQL）準備後、getCurrentUserによる認証チェック＋システム管理者ロール判定を追加する
// 会社名の変更・有効化／無効化API（docs/README.md C2「PATCH /api/system/companies/:id」参照）
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = (await request.json()) as PatchCompanyBody
  try {
    return NextResponse.json(updateCompanyDetail(id, body))
  } catch (error) {
    return handleServiceError(error)
  }
}
