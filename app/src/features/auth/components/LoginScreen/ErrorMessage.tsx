interface ErrorMessageProps {
  message: string
}

// 認証エラー時のメッセージを表示する
export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <p role="alert" className="text-[12px] text-danger">
      {message}
    </p>
  )
}
