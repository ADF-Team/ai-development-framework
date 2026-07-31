import { NextResponse } from 'next/server'
import { handleServiceError } from '@/utils/handleServiceError'
import { getPublishedTemplateList } from './service'

// TODO: インフラ（Cloud SQL）準備後、getCurrentUserによる認証チェックを追加する
// 公開テンプレート一覧取得API（docs/README.md C2「GET /api/templates/published」参照）
export async function GET() {
  try {
    return NextResponse.json({ templates: getPublishedTemplateList() })
  } catch (error) {
    return handleServiceError(error)
  }
}
