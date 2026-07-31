import { NextResponse } from 'next/server'
import { publishTemplate } from '@/lib/services/templates'
import { handleServiceError } from '@/utils/handleServiceError'

// TODO: インフラ（Cloud SQL）準備後、getCurrentUserによる認証チェック＋管理者ロール判定を追加する
// テンプレート公開API（templates.published_atを現在時刻に更新する。既に公開済みの場合は何もしない）
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const { templateId } = await params
  try {
    return NextResponse.json(publishTemplate(templateId))
  } catch (error) {
    return handleServiceError(error)
  }
}
