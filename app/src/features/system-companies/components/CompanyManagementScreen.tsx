'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useAtom } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { Button } from '@/components/ui/button'
import { messages } from '@/constants/messages'
import { companyListAtom } from '../stores/companyListAtom'
import { CompanyListTable } from './CompanyManagementScreen/CompanyListTable'
import { NewCompanyModal } from './CompanyManagementScreen/NewCompanyModal'
import type { CompanyListItem } from '@/types/Company'

// 会社管理画面（/system/companies）のエントリーポイント。システム管理者のみアクセス可能
export function CompanyManagementScreen({
  companies,
}: {
  companies: CompanyListItem[]
}) {
  useHydrateAtoms([[companyListAtom, companies]])
  const [companyList, setCompanyList] = useAtom(companyListAtom)
  const [showNewCompanyModal, setShowNewCompanyModal] = useState(false)

  const handleUpdated = (updated: CompanyListItem) => {
    setCompanyList((prev) =>
      prev.map((company) => (company.id === updated.id ? updated : company))
    )
  }

  return (
    <div className="mx-auto w-full max-w-300 flex-1 p-8">
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="font-heading text-[42px] font-semibold">
          {messages.companyManagement.listTitle}
        </h1>
        <Button
          variant="outline"
          className="h-auto gap-1.5 rounded-md border-accent px-2.5 py-[5.6px] font-heading text-sm font-medium text-accent hover:bg-accent/12 hover:text-accent active:bg-accent/22"
          onClick={() => setShowNewCompanyModal(true)}
        >
          <Plus className="size-4" />
          {messages.companyManagement.createButton}
        </Button>
      </div>

      <CompanyListTable companies={companyList} onUpdated={handleUpdated} />

      <NewCompanyModal
        open={showNewCompanyModal}
        onOpenChange={setShowNewCompanyModal}
        onCreated={(company) => setCompanyList((prev) => [...prev, company])}
      />
    </div>
  )
}
