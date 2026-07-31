import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tag } from '@/components/tag/Tag'
import { messages } from '@/constants/messages'
import { ToggleStatusButton } from './CompanyListTable/ToggleStatusButton'
import type { CompanyListItem } from '@/types/Company'

const STATUS_TAG_CLASS: Record<CompanyListItem['status'], string> = {
  active: 'bg-neutral-800 text-neutral-100',
  suspended: 'border border-accent text-accent',
}

// 会社管理画面：会社一覧テーブル（会社名・作成日・ステータス表示、有効化／無効化操作を行う）
export function CompanyListTable({
  companies,
  onUpdated,
}: {
  companies: CompanyListItem[]
  onUpdated: (company: CompanyListItem) => void
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{messages.companyManagement.table.nameHeader}</TableHead>
          <TableHead>
            {messages.companyManagement.table.createdAtHeader}
          </TableHead>
          <TableHead>{messages.companyManagement.table.statusHeader}</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {companies.map((company) => (
          <TableRow key={company.id}>
            <TableCell>{company.name}</TableCell>
            <TableCell className="text-text/55">{company.createdAt}</TableCell>
            <TableCell>
              <Tag className={STATUS_TAG_CLASS[company.status]}>
                {messages.companyManagement.statusLabel[company.status]}
              </Tag>
            </TableCell>
            <TableCell>
              <ToggleStatusButton company={company} onUpdated={onUpdated} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
