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
import { messages } from '@/constants/messages'
import {
  DISPLAY_NAME_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
} from '@/constants/validation'
import { useApiAction } from '@/hooks/useApiAction'
import { postCreateCompany } from '@/lib/frontend/apiClient/systemCompanies/postCreateCompany'
import { createCompanySchema } from '@/schemas/createCompanySchema'
import type { CompanyListItem } from '@/types/Company'

// 会社管理画面：会社作成モーダル（会社名・初期管理者のメールアドレス・表示名を指定して作成する）
export function NewCompanyModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (company: CompanyListItem) => void
}) {
  const [companyName, setCompanyName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminDisplayName, setAdminDisplayName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const { run, isLoading } = useApiAction(postCreateCompany)

  // モーダルを閉じる際、開き方（キャンセル操作／Escape／外側クリック）によらず入力値とエラーメッセージをリセットする
  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setCompanyName('')
      setAdminEmail('')
      setAdminDisplayName('')
      setErrorMessage('')
    }
    onOpenChange(next)
  }

  const handleCreate = async () => {
    const validation = createCompanySchema.safeParse({
      companyName,
      adminEmail,
      adminDisplayName,
    })
    if (!validation.success) {
      setErrorMessage(validation.error.issues[0].message)
      return
    }
    setErrorMessage('')

    const company = await run(validation.data)
    if (company) {
      onCreated(company)
      handleOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {messages.companyManagement.newCompanyModal.title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-company-name">
            {messages.companyManagement.newCompanyModal.nameLabel}
          </Label>
          <Input
            id="new-company-name"
            placeholder={
              messages.companyManagement.newCompanyModal.namePlaceholder
            }
            value={companyName}
            maxLength={NAME_MAX_LENGTH}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-company-admin-email">
            {messages.companyManagement.newCompanyModal.adminEmailLabel}
          </Label>
          <Input
            id="new-company-admin-email"
            type="email"
            placeholder={
              messages.companyManagement.newCompanyModal.adminEmailPlaceholder
            }
            value={adminEmail}
            maxLength={EMAIL_MAX_LENGTH}
            onChange={(e) => setAdminEmail(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-company-admin-name">
            {messages.companyManagement.newCompanyModal.adminNameLabel}
          </Label>
          <Input
            id="new-company-admin-name"
            placeholder={
              messages.companyManagement.newCompanyModal.adminNamePlaceholder
            }
            value={adminDisplayName}
            maxLength={DISPLAY_NAME_MAX_LENGTH}
            onChange={(e) => setAdminDisplayName(e.target.value)}
          />
        </div>

        <p className="text-[12px] text-text/70">
          {messages.companyManagement.newCompanyModal.description}
        </p>

        {errorMessage && (
          <p className="text-[13px] text-destructive">{errorMessage}</p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleOpenChange(false)}
          >
            {messages.companyManagement.newCompanyModal.cancelButton}
          </Button>
          <Button type="button" disabled={isLoading} onClick={handleCreate}>
            {messages.companyManagement.newCompanyModal.createButton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
