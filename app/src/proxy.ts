import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE_NAME } from '@/config/env'

const NO_AUTH_PATHS = ['/', '/login']

// 未ログインで保護ルートにアクセスした場合は/loginへ、ログイン済みで/や/loginにアクセスした場合は/projectsへリダイレクトする
export function proxy(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const isNoAuthPath = NO_AUTH_PATHS.includes(request.nextUrl.pathname)

  if (!session && !isNoAuthPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (session && isNoAuthPath) {
    return NextResponse.redirect(new URL('/projects', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/projects/:path*',
    '/admin/:path*',
    '/templates/:path*',
    '/system/:path*',
  ],
}
