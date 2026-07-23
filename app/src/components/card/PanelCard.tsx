import { cn } from '@/lib/utils'

// 案件詳細画面等で使う汎用パネルカード（角丸・背景・影のみを共通化する）
export function PanelCard({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex flex-col gap-[5.6px] rounded-md bg-surface p-[8.4px] shadow-sm',
        className
      )}
      {...props}
    />
  )
}

// PanelCard内の見出しラベル（アクセントカラー・小文字トラッキング）
export function PanelCardKicker({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'text-[11px] tracking-widest text-accent uppercase',
        className
      )}
      {...props}
    />
  )
}
