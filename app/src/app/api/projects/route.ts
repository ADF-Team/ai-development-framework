import { NextResponse } from 'next/server'
import { listProjects } from '@/lib/services/projects'

// TODO: インフラ（Cloud SQL）準備後、getCurrentUserによる認証チェックを追加する
// 案件一覧取得API（現在はlib/services/projectsのモックストアから返す。docs/README.md C2「GET /api/projects」参照）
export async function GET() {
  return NextResponse.json({ projects: listProjects() })
}
