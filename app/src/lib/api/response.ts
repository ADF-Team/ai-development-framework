import { NextResponse } from 'next/server'
import { messages } from '@/constants/messages'

/**
 * 成功レスポンスを返す
 * @param data - レスポンスボディ
 * @param init - ステータスコード等（省略時は200）
 */
export function apiSuccess<T>(data: T, init?: { status?: number }) {
  return NextResponse.json(data, { status: init?.status ?? 200 })
}

/**
 * エラーレスポンスを返す（`{ detail }`形式。lib/frontend/apiClientのfetchDataが読み取る形式と一致させる）
 * @param status - HTTPステータスコード
 * @param detail - 詳細メッセージ（省略時はステータスコードに応じた既定文言はクライアント側のfetchDataが補う）
 */
export function apiError(status: number, detail?: string) {
  return NextResponse.json(
    { detail: detail ?? messages.common.errorMessage.otherError },
    { status }
  )
}
