import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { messages } from '@/constants/messages'

// マイテンプレート一覧画面：「公開する」ボタン押下時に表示する確認モーダル
export function PublishConfirmModal({
  open,
  isPublishing,
  onCancel,
  onConfirm,
}: {
  open: boolean
  isPublishing: boolean
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
            {messages.adminTemplates.publishConfirmModal.title}
          </DialogTitle>
        </DialogHeader>

        <p className="text-[13px] text-text/70">
          {messages.adminTemplates.publishConfirmModal.description}
        </p>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onCancel}>
            {messages.adminTemplates.publishConfirmModal.cancelButton}
          </Button>
          <Button type="button" disabled={isPublishing} onClick={onConfirm}>
            {messages.adminTemplates.publishConfirmModal.confirmButton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
