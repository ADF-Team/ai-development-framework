import { NextResponse } from 'next/server'
import { executeStage } from '@/lib/services/projects'
import { handleServiceError } from '@/utils/handleServiceError'

// TODO: インフラ（Cloud SQL）準備後、getCurrentUserによる認証チェック＋組織一致チェックを追加する
// AI実行API（アプリ内実行モード時のみ呼び出す。docs/README.md C2「POST /api/projects/:id/stages/:stageKey/execute」参照）
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string; stageKey: string }> }
) {
  const { id, stageKey } = await params
  try {
    return NextResponse.json(executeStage(id, stageKey))
  } catch (error) {
    return handleServiceError(error)
  }
}
