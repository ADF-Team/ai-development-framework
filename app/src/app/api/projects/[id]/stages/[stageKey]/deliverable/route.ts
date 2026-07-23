import { NextResponse } from 'next/server'
import { saveDeliverable } from '@/lib/services/projects'
import { handleServiceError } from '@/utils/handleServiceError'

// TODO: インフラ（Cloud SQL）準備後、getCurrentUserによる認証チェック＋組織一致チェックを追加する
// 成果物保存API（プロンプトのみモードでの貼り付け・既存成果物の編集の両方に使用。docs/README.md C2「PATCH /api/projects/:id/stages/:stageKey/deliverable」参照）
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; stageKey: string }> }
) {
  const { id, stageKey } = await params
  const body = (await request.json()) as { content?: string }
  try {
    return NextResponse.json(saveDeliverable(id, stageKey, body.content ?? ''))
  } catch (error) {
    return handleServiceError(error)
  }
}
