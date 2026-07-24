import { NextResponse } from 'next/server'
import { getStageTemplateVersion } from '@/lib/services/templates'
import { handleServiceError } from '@/utils/handleServiceError'

// TODO: インフラ（Cloud SQL）準備後、getCurrentUserによる認証チェック＋管理者ロール判定を追加する
// テンプレートの特定バージョン・指定工程の内容取得API（バージョン履歴の差分表示用）
export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ templateId: string; stageKey: string; version: string }>
  }
) {
  const { templateId, stageKey, version } = await params
  try {
    return NextResponse.json(
      getStageTemplateVersion(templateId, stageKey, Number(version))
    )
  } catch (error) {
    return handleServiceError(error)
  }
}
