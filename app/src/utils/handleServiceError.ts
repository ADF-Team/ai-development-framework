import { NextResponse } from 'next/server'
import { ServiceError } from '@/lib/services/projects'

/**
 * lib/servicesのServiceErrorをAPI RouteのレスポンスJSONに変換する
 * @param error - catchされたエラー
 */
export function handleServiceError(error: unknown) {
  if (error instanceof ServiceError) {
    return NextResponse.json(
      { detail: error.message },
      { status: error.status }
    )
  }
  throw error
}
