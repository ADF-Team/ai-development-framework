import { NextResponse } from 'next/server'
import { getStageDetail } from '@/lib/services/projects'
import { handleServiceError } from '@/utils/handleServiceError'

// TODO: インフラ（Cloud SQL）準備後、getCurrentUserによる認証チェック＋組織一致チェックを追加する
// 工程詳細取得API（質問・回答・プロンプト・成果物・品質ゲート状況。docs/README.md C2「GET /api/projects/:id/stages/:stageKey」参照）
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; stageKey: string }> }
) {
  const { id, stageKey } = await params
  try {
    return NextResponse.json(getStageDetail(id, stageKey))
  } catch (error) {
    return handleServiceError(error)
  }
}
