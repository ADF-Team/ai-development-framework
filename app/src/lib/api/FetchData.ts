'use server'

import { cookies } from 'next/headers'
import { messages } from '@/constants/messages'
import { ERROR_STATUS, SUCCESS_STATUS } from '@/constants/response'
import { APP_URL, SESSION_COOKIE_NAME } from '@/config/env'

export interface QueryParams {
  [key: string]: string | number | boolean | undefined
}

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: Record<string, unknown>
  headers?: Record<string, string>
}

/**
 * 共通APIフェッチ関数（Server Action）
 * @param path - APIパス（例: '/projects'）※先頭に/apiは付けない
 * @param params - クエリパラメータ（GET時のみ使用）
 * @param options - fetchのoptions（method・body等。省略時はGET）
 * @returns レスポンスのJSON。エラー時は`error`プロパティ（status/messages/errorText）を含む
 */
export async function fetchData(
  path: string,
  params?: QueryParams,
  options?: FetchOptions
) {
  try {
    const url = new URL(`${APP_URL}/api${path}`)
    const cookiesStore = await cookies()
    const sessionToken = cookiesStore.get(SESSION_COOKIE_NAME)?.value

    if (params && (!options?.method || options.method === 'GET')) {
      for (const key of Object.keys(params)) {
        if (params[key] !== '' && params[key] !== undefined) {
          url.searchParams.append(key, String(params[key]))
        }
      }
    }

    const fetchOptions: RequestInit = {
      method: options?.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
        ...options?.headers,
      },
    }

    if (options?.body && options.method !== 'GET') {
      fetchOptions.body = JSON.stringify(options.body)
    }

    const response = await fetch(url.toString(), fetchOptions)

    if (!response.ok) {
      // レスポンスボディからdetailメッセージを取得（存在する場合）
      let errorDetail: string | null = null
      try {
        const errorBody = await response.json()
        errorDetail = errorBody?.detail || null
      } catch {
        // JSONパース失敗は無視
      }

      // ステータスコードとエラーメッセージのマッピング
      const errorMessageMap: Record<number, string> = {
        [ERROR_STATUS.UNAUTHORIZED]: messages.common.errorMessage.unauthorized,
        [ERROR_STATUS.FORBIDDEN]: messages.common.errorMessage.forbidden,
        [ERROR_STATUS.NOT_FOUND]: messages.common.errorMessage.notFound,
        [ERROR_STATUS.CONFLICT]: messages.common.errorMessage.conflict,
        [ERROR_STATUS.UNPROCESSABLE_ENTITY]:
          messages.common.errorMessage.unprocessableEntity,
        [ERROR_STATUS.TOO_MANY_REQUESTS]:
          messages.common.errorMessage.tooManyRequests,
        [ERROR_STATUS.INTERNAL_SERVER_ERROR]:
          messages.common.errorMessage.internalServerError,
        [ERROR_STATUS.BAD_GATEWAY]: messages.common.errorMessage.badGateway,
      }

      return {
        error: {
          status: response.status,
          messages:
            errorDetail ||
            errorMessageMap[response.status] ||
            messages.common.errorMessage.otherError,
          errorText: `Failed to fetch ${APP_URL}/api${path} ${response.status}`,
        },
      }
    }

    if (response.status === SUCCESS_STATUS.NO_CONTENT) {
      return {}
    }

    return await response.json()
  } catch (error: unknown) {
    return {
      error: {
        status: ERROR_STATUS.INTERNAL_SERVER_ERROR,
        messages: messages.common.errorMessage.error,
        errorText:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      },
    }
  }
}
