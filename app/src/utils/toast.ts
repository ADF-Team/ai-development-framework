import { toast } from 'sonner'

/**
 * 成功トーストを表示する
 * @param message - 表示するメッセージ
 */
export const showSuccessToast = (message: string) => {
  toast.success(message)
}

/**
 * エラートーストを表示する
 * @param message - 表示するメッセージ
 */
export const showErrorToast = (message: string) => {
  toast.error(message)
}
