import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { messages } from '@/constants/messages'

// 案件一覧画面の見出しと新規作成ボタン
export function ProjectListHeader() {
  return (
    <div className="mb-6 flex items-baseline justify-between">
      <h1 className="font-heading text-[42px] font-semibold">
        {messages.projects.title}
      </h1>
      {/* TODO: NewProjectModalを実装し、POST /api/projectsで案件を作成できるようにする */}
      <Button
        variant="outline"
        className="h-auto gap-1.5 rounded-md border-accent px-2.5 py-[5.6px] font-heading text-sm font-medium text-accent hover:bg-accent/12 hover:text-accent active:bg-accent/22"
      >
        <Plus className="size-4" />
        {messages.projects.newProjectButton}
      </Button>
    </div>
  )
}
