import { NextResponse } from 'next/server'
import { listUsers, inviteUser } from '@/lib/services/users'
import { handleServiceError } from '@/utils/handleServiceError'
import type { UserRole } from '@/types/User'

interface PostUserBody {
  email: string
  role: UserRole
  displayName: string
}

// TODO: インフラ（Cloud SQL）準備後、getCurrentUserによる認証チェック＋管理者ロール判定を追加する
// 組織内メンバー一覧取得API（docs/README.md C2「GET /api/admin/users」参照）
export async function GET() {
  return NextResponse.json({ users: listUsers() })
}

// メンバー招待API（Identity Platform側のユーザー作成・招待メール送信は別途行う。docs/README.md C2「POST /api/admin/users」参照）
export async function POST(request: Request) {
  const body = (await request.json()) as PostUserBody
  try {
    return NextResponse.json(inviteUser(body), { status: 201 })
  } catch (error) {
    return handleServiceError(error)
  }
}
