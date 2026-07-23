import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// clsxでクラス名を結合し、tailwind-mergeで競合するTailwindクラスを解決する（shadcn/ui生成物が参照する規約上のヘルパー）
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
