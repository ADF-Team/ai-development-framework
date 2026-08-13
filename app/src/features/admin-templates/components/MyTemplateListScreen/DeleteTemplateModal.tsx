import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { messages } from '@/constants/messages'

// マイテンプレート一覧画面：「削除する」ボタン押下時に表示する確認モーダル
export function DeleteTemplateModal({
  open,
  isPublished,
  isDeleting,
  onCancel,
  onConfirm,
}: {
  open: boolean
  isPublished: boolean
  isDeleting: boolean
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
            {messages.adminTemplates.deleteConfirmModal.title}
          </DialogTitle>
        </DialogHeader>

        <p className="text-[13px] text-text/70">
          {messages.adminTemplates.deleteConfirmModal.description}
        </p>
        {isPublished && (
          <p className="text-[13px] text-destructive">
            {messages.adminTemplates.deleteConfirmModal.publishedWarning}
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onCancel}>
            {messages.adminTemplates.deleteConfirmModal.cancelButton}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting}
            onClick={onConfirm}
          >
            {messages.adminTemplates.deleteConfirmModal.confirmButton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
