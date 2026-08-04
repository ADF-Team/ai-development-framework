import { useState } from 'react'

/**
 * API呼び出しのローディング状態を管理する共通フック
 * @param action - src/lib/frontend/apiClient の関数（成功時は値、失敗時はnullを返す想定）
 * @returns run（実行関数）とisLoading
 */
export function useApiAction<Args extends unknown[], T>(
  action: (...args: Args) => Promise<T | null>
) {
  const [isLoading, setIsLoading] = useState(false)

  const run = async (...args: Args) => {
    setIsLoading(true)
    const result = await action(...args)
    setIsLoading(false)
    return result
  }

  return { run, isLoading }
}
