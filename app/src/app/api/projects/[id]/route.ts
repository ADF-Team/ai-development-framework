import { NextResponse } from 'next/server'
import { getProjectDetail } from '@/lib/services/projects'
import { handleServiceError } from '@/utils/handleServiceError'

// TODO: インフラ（Cloud SQL）準備後、getCurrentUserによる認証チェック＋組織一致チェックを追加する
// 案件詳細取得API（docs/README.md C2「GET /api/projects/:id」参照）
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    return NextResponse.json(getProjectDetail(id))
  } catch (error) {
    return handleServiceError(error)
  }
}
