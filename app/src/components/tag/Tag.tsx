import { cn } from '@/lib/utils'

// 汎用バッジタグ（角丸・パディング・フォントサイズのみを共通化し、配色は呼び出し側のclassNameで指定する）
export function Tag({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[6px] px-2.5 py-0.75 text-[11px] tracking-[0.02em]',
        className
      )}
      {...props}
    />
  )
}
