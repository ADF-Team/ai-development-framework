import { randomUUID } from 'crypto'
import * as repository from './repository'
import type { InviteUserInput } from '@/schemas/inviteUserSchema'
import type { UpdateUserInput } from '@/schemas/api/updateUserSchema'

// 組織内メンバー一覧を取得する
export function getUserList(organizationId: string) {
  return repository.findUsersByOrganization(organizationId)
}

// 組織内メンバーを招待する
export function inviteUser(organizationId: string, input: InviteUserInput) {
  return repository.insertUser({
    organizationId,
    // TODO: Identity Platform連携実装後、実際に作成したユーザーのUIDに置き換える
    identityPlatformUid: `pending:${randomUUID()}`,
    email: input.email,
    displayName: input.displayName,
    role: input.role,
  })
}

// メンバーのロール変更、またはアカウントの無効化／再有効化を行う
export function updateUser(
  organizationId: string,
  id: string,
  input: UpdateUserInput
) {
  return repository.saveUser(organizationId, id, input)
}
