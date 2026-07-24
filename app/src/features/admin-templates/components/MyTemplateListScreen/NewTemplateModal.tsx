'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { messages } from '@/constants/messages'
import { NAME_MAX_LENGTH } from '@/constants/validation'
import { useApiAction } from '@/hooks/useApiAction'
import { createTemplate } from '@/lib/api/adminTemplates/createTemplate'
import { newTemplateFormSchema } from '../../schemas/newTemplateFormSchema'

// マイテンプレート一覧画面：新規テンプレート作成モーダル。作成後はそのテンプレートの編集画面へ遷移する
export function NewTemplateModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const { run, isLoading } = useApiAction(createTemplate)

  const handleCreate = async () => {
    const validation = newTemplateFormSchema.safeParse({ title })
    if (!validation.success) {
      setErrorMessage(validation.error.issues[0].message)
      return
    }
    setErrorMessage('')

    const id = await run(title)
    if (id) {
      setTitle('')
      onOpenChange(false)
      router.push(`/admin/templates/${id}`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {messages.adminTemplates.newTemplateModal.title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-template-title">
            {messages.adminTemplates.newTemplateModal.nameLabel}
          </Label>
          <Input
            id="new-template-title"
            placeholder={
              messages.adminTemplates.newTemplateModal.namePlaceholder
            }
            value={title}
            maxLength={NAME_MAX_LENGTH}
            onChange={(e) => setTitle(e.target.value)}
          />
          {errorMessage && (
            <p className="text-[13px] text-destructive">{errorMessage}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            {messages.adminTemplates.newTemplateModal.cancelButton}
          </Button>
          <Button type="button" disabled={isLoading} onClick={handleCreate}>
            {messages.adminTemplates.newTemplateModal.createButton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
