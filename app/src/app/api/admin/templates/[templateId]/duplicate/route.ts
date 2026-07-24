import { NextResponse } from 'next/server'
import { duplicateTemplate } from '@/lib/services/templates'
import { handleServiceError } from '@/utils/handleServiceError'

// TODO: インフラ（Cloud SQL）準備後、getCurrentUserによる認証チェック＋管理者ロール判定を追加する
// テンプレート複製API（現在有効な版の内容をコピーした新規テンプレートを作成する）
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const { templateId } = await params
  try {
    return NextResponse.json(duplicateTemplate(templateId), { status: 201 })
  } catch (error) {
    return handleServiceError(error)
  }
}
