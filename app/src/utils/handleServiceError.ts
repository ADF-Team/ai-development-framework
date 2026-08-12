import { ServiceError } from '@/lib/services/ServiceError'
import { apiError } from '@/lib/api/response'

/**
 * lib/servicesのServiceErrorをAPI RouteのレスポンスJSONに変換する
 * @param error - catchされたエラー
 */
export function handleServiceError(error: unknown) {
  if (error instanceof ServiceError) {
    return apiError(error.status, error.message)
  }
  throw error
}
