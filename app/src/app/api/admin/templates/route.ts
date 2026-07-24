import { NextResponse } from 'next/server'
import { listTemplates, createTemplate } from '@/lib/services/templates'
import { handleServiceError } from '@/utils/handleServiceError'

// TODO: インフラ（Cloud SQL）準備後、getCurrentUserによる認証チェック＋管理者ロール判定を追加する
// マイテンプレート一覧取得API（テンプレート概要一覧。docs/README.md C2「GET /api/admin/templates」参照）
export async function GET() {
  return NextResponse.json({ templates: listTemplates() })
}

interface PostTemplateBody {
  title: string
}

// テンプレート新規作成API（7工程分の空の内容で初期化される）
export async function POST(request: Request) {
  const body = (await request.json()) as PostTemplateBody
  try {
    return NextResponse.json(createTemplate(body), { status: 201 })
  } catch (error) {
    return handleServiceError(error)
  }
}
