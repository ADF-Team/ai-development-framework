import { NextResponse } from 'next/server'
import { listInProgressProjectsByTemplate } from '@/lib/services/projects'

// TODO: インフラ（Cloud SQL）準備後、getCurrentUserによる認証チェック＋管理者ロール判定を追加する
// テンプレート編集時の影響確認用：このテンプレートを参照している進行中の案件一覧取得API
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const { templateId } = await params
  return NextResponse.json({
    projects: listInProgressProjectsByTemplate(templateId),
  })
}
