import { NextResponse } from 'next/server'
import { handleServiceError } from '@/utils/handleServiceError'
import { requireAdmin } from '@/lib/api/auth/requireAdmin'
import { SUCCESS_STATUS } from '@/constants/response'
import { deleteTemplate } from '../service'

// テンプレート削除API（バージョン履歴・7工程分の内容も含めて完全に削除する。取り消し不可）
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const { templateId } = await params

  try {
    const user = await requireAdmin()
    await deleteTemplate(user.organizationId, templateId)
    return new NextResponse(null, { status: SUCCESS_STATUS.NO_CONTENT })
  } catch (error) {
    return handleServiceError(error)
  }
}
