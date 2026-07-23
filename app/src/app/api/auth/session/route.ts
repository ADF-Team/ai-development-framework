import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getFirebaseAdminAuth } from '@/lib/auth/firebaseAdmin'
import { prisma } from '@/lib/prisma'
import { ERROR_STATUS, SUCCESS_STATUS } from '@/constants/response'
import { SESSION_COOKIE_NAME, SESSION_EXPIRES_IN_MS } from '@/config/env'

/**
 * IDトークンを検証し、セッションCookie（httpOnly）を発行する
 */
export async function POST(request: NextRequest) {
  const { idToken } = (await request.json()) as { idToken?: string }

  if (!idToken) {
    return NextResponse.json(
      { detail: 'IDトークンが指定されていません。' },
      { status: ERROR_STATUS.UNPROCESSABLE_ENTITY }
    )
  }

  let decoded
  try {
    decoded = await getFirebaseAdminAuth().verifyIdToken(idToken)
  } catch {
    return NextResponse.json(
      { detail: '認証情報が無効です。' },
      { status: ERROR_STATUS.UNAUTHORIZED }
    )
  }

  const user = await prisma.user.findUnique({
    where: { identityPlatformUid: decoded.uid },
  })
  if (!user || user.status === 'disabled') {
    return NextResponse.json(
      { detail: 'このアカウントは利用できません。' },
      { status: ERROR_STATUS.FORBIDDEN }
    )
  }

  const sessionCookie = await getFirebaseAdminAuth().createSessionCookie(
    idToken,
    {
      expiresIn: SESSION_EXPIRES_IN_MS,
    }
  )

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_EXPIRES_IN_MS / 1000,
  })

  return new NextResponse(null, { status: SUCCESS_STATUS.NO_CONTENT })
}
