import { cookies } from 'next/headers'
import { getFirebaseAdminAuth } from './firebaseAdmin'
import { prisma } from '@/lib/api/prisma'
import { SESSION_COOKIE_NAME } from '@/config/env'

/**
 * セッションCookieから現在のユーザー情報を取得する
 * @returns ユーザー情報（未ログイン・無効化済みの場合はnull）
 */
export async function getCurrentUser() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!sessionCookie) return null

  let uid: string
  try {
    const decoded =
      await getFirebaseAdminAuth().verifySessionCookie(sessionCookie)
    uid = decoded.uid
  } catch {
    // セッションCookieが無効・期限切れの場合のみ未ログイン扱いにする
    return null
  }

  // ここから先のエラー（DB障害等）は未ログインと区別するため呼び出し元へそのまま伝播させる
  const user = await prisma.user.findUnique({
    where: { identityPlatformUid: uid },
  })
  if (!user || user.status === 'disabled') return null
  return user
}
