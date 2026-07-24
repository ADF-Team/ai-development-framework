import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { messages } from '@/constants/messages'

// テンプレート詳細画面：保存すると影響を受ける進行中の案件一覧を表示し、保存の続行を確認するモーダル
export function SaveImpactModal({
  open,
  projects,
  isSaving,
  onCancel,
  onConfirm,
}: {
  open: boolean
  projects: { id: string; name: string }[]
  isSaving: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {messages.adminTemplates.saveImpactModal.title}
          </DialogTitle>
        </DialogHeader>

        <p className="text-[13px] text-text/70">
          {messages.adminTemplates.saveImpactModal.description}
        </p>

        <ul className="flex max-h-60 flex-col gap-1.5 overflow-y-auto">
          {projects.map((project) => (
            <li
              key={project.id}
              className="rounded-md border border-divider px-3 py-2 text-[13px]"
            >
              {project.name}
            </li>
          ))}
        </ul>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onCancel}>
            {messages.adminTemplates.saveImpactModal.cancelButton}
          </Button>
          <Button type="button" disabled={isSaving} onClick={onConfirm}>
            {messages.adminTemplates.saveImpactModal.confirmButton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
