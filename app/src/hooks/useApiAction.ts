import { useState } from 'react'
import { showErrorToast, showSuccessToast } from '@/utils/toast'

/**
 * src/lib/frontend/apiClientのミューテーション関数（Server Action）が返す結果の形。
 *
 * Server Actionの関数本体はサーバー側で実行されるため、その中で直接sonnerの`toast()`を呼んでも
 * 効果を持たない（ブラウザに戻ってきてから表示する必要がある）。そのためトースト表示は行わず、
 * 呼び出し結果としてメッセージを返すだけにし、実際の表示は本フック（クライアント側で実行される）が行う
 */
export type ApiActionResult<T> =
  | { ok: true; data: T; message: string; toastType?: 'success' | 'error' }
  | { ok: false; error: string }

/**
 * API呼び出しのローディング状態管理と、成功／失敗トースト表示を行う共通フック
 * @param action - src/lib/frontend/apiClient のミューテーション関数（ApiActionResultを返す想定）
 * @returns run（実行関数。成功時は値、失敗時はnullを返す）とisLoading
 */
export function useApiAction<Args extends unknown[], T>(
  action: (...args: Args) => Promise<ApiActionResult<T>>
) {
  const [isLoading, setIsLoading] = useState(false)

  const run = async (...args: Args): Promise<T | null> => {
    setIsLoading(true)
    const result = await action(...args)
    setIsLoading(false)

    if (!result.ok) {
      showErrorToast(result.error)
      return null
    }

    if (result.toastType === 'error') {
      showErrorToast(result.message)
    } else {
      showSuccessToast(result.message)
    }
    return result.data
  }

  return { run, isLoading }
}
