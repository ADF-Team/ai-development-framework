import { Ban, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { messages } from '@/constants/messages'
import { useApiAction } from '@/hooks/useApiAction'
import { patchCompany } from '@/lib/frontend/apiClient/systemCompanies/patchCompany'
import type { CompanyListItem } from '@/types/Company'

// 会社管理画面：会社一覧の1行分の有効化／無効化ボタン
export function ToggleStatusButton({
  company,
  onUpdated,
}: {
  company: CompanyListItem
  onUpdated: (company: CompanyListItem) => void
}) {
  const { run, isLoading } = useApiAction(patchCompany)
  const isSuspended = company.status === 'suspended'

  const handleClick = async () => {
    const updated = await run(company.id, {
      status: isSuspended ? 'active' : 'suspended',
    })
    if (updated) {
      onUpdated(updated)
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={isLoading}
      onClick={handleClick}
      className="px-[2.8px] text-accent hover:bg-accent/10 hover:text-accent active:bg-accent/18"
    >
      {isSuspended ? (
        <RotateCcw className="size-3.5" />
      ) : (
        <Ban className="size-3.5" />
      )}
      {isSuspended
        ? messages.companyManagement.enableButton
        : messages.companyManagement.disableButton}
    </Button>
  )
}
