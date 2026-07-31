import { NextResponse } from 'next/server'
import { unpublishTemplate } from '@/lib/services/templates'
import { handleServiceError } from '@/utils/handleServiceError'

// TODO: インフラ（Cloud SQL）準備後、getCurrentUserによる認証チェック＋管理者ロール判定を追加する
// テンプレート非公開API（templates.published_atをnullに戻す。既に非公開の場合は何もしない）
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const { templateId } = await params
  try {
    return NextResponse.json(unpublishTemplate(templateId))
  } catch (error) {
    return handleServiceError(error)
  }
}
