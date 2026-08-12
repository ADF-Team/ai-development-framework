import type { z } from 'zod'
import { NextResponse } from 'next/server'
import { messages } from '@/constants/messages'
import { ERROR_STATUS } from '@/constants/response'
import { apiError } from '@/lib/api/response'

type ParseResult<T> =
  | { data: T; errorResponse?: never }
  | { data?: never; errorResponse: NextResponse }

/**
 * リクエストボディをJSONとしてパースし、zodスキーマで検証する
 * @param request - パース対象のRequest
 * @param schema - 検証に使うzodスキーマ
 * @returns 検証済みデータ。失敗時は422の`{ detail }`レスポンスを`errorResponse`に含めて返す
 */
export async function parseRequestBody<T>(
  request: Request,
  schema: z.ZodType<T>
): Promise<ParseResult<T>> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return {
      errorResponse: apiError(
        ERROR_STATUS.UNPROCESSABLE_ENTITY,
        messages.common.errorMessage.unprocessableEntity
      ),
    }
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return {
      errorResponse: apiError(
        ERROR_STATUS.UNPROCESSABLE_ENTITY,
        parsed.error.issues[0].message
      ),
    }
  }

  return { data: parsed.data }
}
