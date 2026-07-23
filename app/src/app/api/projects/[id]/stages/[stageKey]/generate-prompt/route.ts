import { NextResponse } from 'next/server'
import { generateStagePrompt } from '@/lib/services/projects'
import { handleServiceError } from '@/utils/handleServiceError'

// TODO: インフラ（Cloud SQL）準備後、getCurrentUserによる認証チェック＋組織一致チェックを追加する
// プロンプト生成API（保存済みanswersを使用。docs/README.md C2「POST /api/projects/:id/stages/:stageKey/generate-prompt」参照）
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string; stageKey: string }> }
) {
  const { id, stageKey } = await params
  try {
    return NextResponse.json(generateStagePrompt(id, stageKey))
  } catch (error) {
    return handleServiceError(error)
  }
}
