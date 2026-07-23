import { cookies } from 'next/headers'
import { getFirebaseAdminAuth } from './firebaseAdmin'
import { prisma } from '@/lib/prisma'
import { SESSION_COOKIE_NAME } from '@/config/env'

/**
 * セッションCookieから現在のユーザー情報を取得する
 * @returns ユーザー情報（未ログイン・無効化済みの場合はnull）
 */
export async function getCurrentUser() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!sessionCookie) return null

  try {
    const decoded =
      await getFirebaseAdminAuth().verifySessionCookie(sessionCookie)
    const user = await prisma.user.findUnique({
      where: { identityPlatformUid: decoded.uid },
    })
    if (!user || user.status === 'disabled') return null
    return user
  } catch {
    return null
  }
}
