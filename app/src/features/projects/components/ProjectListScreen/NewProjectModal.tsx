'use client'

import { useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { messages } from '@/constants/messages'
import { NAME_MAX_LENGTH } from '@/constants/validation'
import { useApiAction } from '@/hooks/useApiAction'
import { createProject } from '@/lib/api/projects/createProject'
import { newProjectFormSchema } from '../../schemas/newProjectFormSchema'
import type { ProjectListItem } from '@/types/Project'
import type { TemplateSummary } from '@/types/StageTemplate'

// 案件一覧画面：新規案件作成モーダル（テンプレートを選択し、その内容を参照する案件を作成する）
export function NewProjectModal({
  open,
  onOpenChange,
  templates,
  initialTemplateId,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  templates: TemplateSummary[]
  initialTemplateId?: string
  onCreated: (project: ProjectListItem) => void
}) {
  const [name, setName] = useState('')
  const [templateId, setTemplateId] = useState(initialTemplateId ?? '')
  const [errorMessage, setErrorMessage] = useState('')
  const { run, isLoading } = useApiAction(createProject)

  // モーダルを閉じる際、開き方（キャンセル操作／Escape／外側クリック）によらず入力値とエラーメッセージをリセットする
  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setName('')
      setTemplateId(initialTemplateId ?? '')
      setErrorMessage('')
    }
    onOpenChange(next)
  }

  const handleCreate = async () => {
    const validation = newProjectFormSchema.safeParse({ name, templateId })
    if (!validation.success) {
      setErrorMessage(validation.error.issues[0].message)
      return
    }
    setErrorMessage('')

    const project = await run(name, templateId)
    if (project) {
      onCreated(project)
      handleOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{messages.projects.newProjectModal.title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-project-name">
            {messages.projects.newProjectModal.nameLabel}
          </Label>
          <Input
            id="new-project-name"
            placeholder={messages.projects.newProjectModal.namePlaceholder}
            value={name}
            maxLength={NAME_MAX_LENGTH}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-project-template">
            {messages.projects.newProjectModal.templateLabel}
          </Label>
          <Select value={templateId} onValueChange={setTemplateId}>
            <SelectTrigger id="new-project-template" className="w-full">
              <SelectValue
                placeholder={
                  messages.projects.newProjectModal.templatePlaceholder
                }
              />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {errorMessage && (
          <p className="text-[13px] text-destructive">{errorMessage}</p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleOpenChange(false)}
          >
            {messages.projects.newProjectModal.cancelButton}
          </Button>
          <Button type="button" disabled={isLoading} onClick={handleCreate}>
            {messages.projects.newProjectModal.createButton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
