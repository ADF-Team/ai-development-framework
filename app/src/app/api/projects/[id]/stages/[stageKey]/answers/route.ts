import { NextResponse } from 'next/server'
import { saveStageAnswers } from '@/lib/services/projects'
import { handleServiceError } from '@/utils/handleServiceError'

// TODO: インフラ（Cloud SQL）準備後、getCurrentUserによる認証チェック＋組織一致チェックを追加する
// 質問への回答保存API（docs/README.md C2「POST /api/projects/:id/stages/:stageKey/answers」参照）
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; stageKey: string }> }
) {
  const { id, stageKey } = await params
  const body = (await request.json()) as { answers?: Record<string, string> }
  try {
    return NextResponse.json(saveStageAnswers(id, stageKey, body.answers ?? {}))
  } catch (error) {
    return handleServiceError(error)
  }
}
