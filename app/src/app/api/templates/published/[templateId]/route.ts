import { NextResponse } from 'next/server'
import { handleServiceError } from '@/utils/handleServiceError'
import { getPublishedTemplateDetail } from '../service'

// TODO: インフラ（Cloud SQL）準備後、getCurrentUserによる認証チェックを追加する
// 公開テンプレート詳細取得API（現在有効な版の7工程分の内容。docs/README.md C2「GET /api/templates/published/:templateId」参照）
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const { templateId } = await params
  try {
    return NextResponse.json(getPublishedTemplateDetail(templateId))
  } catch (error) {
    return handleServiceError(error)
  }
}
