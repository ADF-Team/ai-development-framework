'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useAtomValue } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { Button } from '@/components/ui/button'
import { messages } from '@/constants/messages'
import { templateListAtom } from '../stores/templateListAtom'
import { TemplateCard } from './MyTemplateListScreen/TemplateCard'
import { NewTemplateModal } from './MyTemplateListScreen/NewTemplateModal'
import type { TemplateSummary } from '@/types/StageTemplate'

// マイテンプレート一覧画面（/admin/templates）のエントリーポイント
export function MyTemplateListScreen({
  templates,
}: {
  templates: TemplateSummary[]
}) {
  useHydrateAtoms([[templateListAtom, templates]])
  const templateList = useAtomValue(templateListAtom)
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false)

  return (
    <div className="mx-auto w-full max-w-300 flex-1 p-8">
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="font-heading text-[42px] font-semibold">
          {messages.adminTemplates.listTitle}
        </h1>
        <Button
          variant="outline"
          className="h-auto gap-1.5 rounded-md border-accent px-2.5 py-[5.6px] font-heading text-sm font-medium text-accent hover:bg-accent/12 hover:text-accent active:bg-accent/22"
          onClick={() => setShowNewTemplateModal(true)}
        >
          <Plus className="size-4" />
          {messages.adminTemplates.newTemplateButton}
        </Button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
        {templateList.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>

      <NewTemplateModal
        open={showNewTemplateModal}
        onOpenChange={setShowNewTemplateModal}
      />
    </div>
  )
}
