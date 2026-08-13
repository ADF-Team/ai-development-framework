import { cookies, headers } from 'next/headers'
import { getFirebaseAdminAuth } from './firebaseAdmin'
import { prisma } from '@/lib/api/prisma'
import { SESSION_COOKIE_NAME } from '@/config/env'

const BEARER_PREFIX = 'Bearer '

/**
 * リクエストからセッションCookieの値を取り出す
 *
 * APIルートは`fetchData`（Server Action）経由で呼ばれる場合が大半で、`fetchData`はCookieをそのまま
 * 転送せず`Authorization: Bearer <session cookie>`ヘッダとして送る（`CLAUDE.md`「認証（セッションCookie）」参照）。
 * 一方、Server Component（`app/(auth)/admin/layout.tsx`等）からブラウザの実リクエストの一部として
 * 直接呼ばれる場合は、Authorizationヘッダは付かずCookieとして届く。両方をサポートする
 */
async function resolveSessionCookie(): Promise<string | undefined> {
  const headerStore = await headers()
  const authorization = headerStore.get('authorization')
  if (authorization?.startsWith(BEARER_PREFIX)) {
    return authorization.slice(BEARER_PREFIX.length)
  }

  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE_NAME)?.value
}

/**
 * セッションCookieから現在のユーザー情報を取得する
 * @returns ユーザー情報（未ログイン・無効化済みの場合はnull）
 */
export async function getCurrentUser() {
  const sessionCookie = await resolveSessionCookie()
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
