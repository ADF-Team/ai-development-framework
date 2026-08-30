'use client'

import { useState } from 'react'
import { Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { messages } from '@/constants/messages'

// 横の拡張ボタンから大きなモーダルを開いて編集できる1行入力。モーダル内外は同じvalue/onChangeを共有するため常に一致する
export function ExpandableInput({
  id,
  value,
  onChange,
  modalTitle,
  placeholder,
  className,
}: {
  id?: string
  value: string
  onChange: (value: string) => void
  modalTitle: string
  placeholder?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="flex flex-1 items-center gap-1">
        <Input
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0 text-muted-foreground"
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
            className="h-[70vh] resize-none"
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
