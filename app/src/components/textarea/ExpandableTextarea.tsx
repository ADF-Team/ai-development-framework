'use client'

import { useState } from 'react'
import { Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { messages } from '@/constants/messages'

// 右下の拡張ボタンから大きなモーダルを開いて編集できるテキストエリア。モーダル内外は同じvalue/onChangeを共有するため常に一致する
export function ExpandableTextarea({
  id,
  value,
  onChange,
  modalTitle,
  rows = 4,
  placeholder,
  monospace = false,
  className,
}: {
  id?: string
  value: string
  onChange: (value: string) => void
  modalTitle: string
  rows?: number
  placeholder?: string
  monospace?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="relative">
        <Textarea
          id={id}
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(monospace && 'font-mono', className)}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute right-1.5 bottom-1.5 text-muted-foreground"
          aria-label={messages.common.expandableTextarea.expandButtonAriaLabel}
          onClick={() => setOpen(true)}
        >
          <Maximize2 />
        </Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
          </DialogHeader>
          <Textarea
            rows={20}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn('h-[70vh] resize-none', monospace && 'font-mono')}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
