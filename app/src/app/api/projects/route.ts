import { NextResponse } from 'next/server'
import { listProjects, createProject } from '@/lib/services/projects'
import { handleServiceError } from '@/utils/handleServiceError'

// TODO: インフラ（Cloud SQL）準備後、getCurrentUserによる認証チェックを追加する
// 案件一覧取得API（現在はlib/services/projectsのモックストアから返す。docs/README.md C2「GET /api/projects」参照）
export async function GET() {
  return NextResponse.json({ projects: listProjects() })
}

interface PostProjectBody {
  name: string
  templateId: string
}

// 案件作成API（選択したテンプレートを参照する状態で、7工程分のレコードを一括作成する。docs/README.md C2「POST /api/projects」参照）
export async function POST(request: Request) {
  const body = (await request.json()) as PostProjectBody
  try {
    return NextResponse.json(createProject(body.name, body.templateId), {
      status: 201,
    })
  } catch (error) {
    return handleServiceError(error)
  }
}
