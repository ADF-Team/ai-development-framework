import { NextResponse } from 'next/server'
import { submitQualityGate } from '@/lib/services/projects'
import { handleServiceError } from '@/utils/handleServiceError'

// TODO: インフラ（Cloud SQL）準備後、getCurrentUserによる認証チェック＋組織一致チェックを追加する
// 品質ゲート判定API（通過時は次工程へ移行。docs/README.md C2「POST /api/projects/:id/stages/:stageKey/quality-gate」参照）
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; stageKey: string }> }
) {
  const { id, stageKey } = await params
  const body = (await request.json()) as { checkedItemIds?: string[] }
  try {
    return NextResponse.json(
      submitQualityGate(id, stageKey, body.checkedItemIds ?? [])
    )
  } catch (error) {
    return handleServiceError(error)
  }
}
