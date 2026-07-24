import { NextResponse } from 'next/server'
import { updateUser } from '@/lib/services/users'
import { handleServiceError } from '@/utils/handleServiceError'
import type { UserRole, UserStatus } from '@/types/User'

interface PatchUserBody {
  role?: UserRole
  status?: UserStatus
}

// TODO: インフラ（Cloud SQL）準備後、getCurrentUserによる認証チェック＋管理者ロール判定を追加する
// メンバーのロール変更／アカウント無効化・再有効化API（docs/README.md C2「PATCH /api/admin/users/:id」参照）
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = (await request.json()) as PatchUserBody
  try {
    return NextResponse.json(updateUser(id, body))
  } catch (error) {
    return handleServiceError(error)
  }
}
