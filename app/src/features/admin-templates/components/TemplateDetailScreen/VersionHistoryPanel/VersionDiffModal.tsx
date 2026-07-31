import { useEffect, useState } from 'react'
import type { Change } from 'diff'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { messages } from '@/constants/messages'
import { getStageTemplateVersion } from '@/lib/frontend/apiClient/adminTemplates/getStageTemplateVersion'
import { buildTemplateDiff } from '../../../utils/buildTemplateDiff'
import type { StageKey } from '@/types/Project'
import type { StageTemplateData } from '@/types/StageTemplate'
import type { TemplateDiff } from '../../../utils/buildTemplateDiff'

// 行単位の差分（Change配列）を、追加行=アクセント背景／削除行=danger背景＋取り消し線で描画する
function DiffLines({ changes }: { changes: Change[] }) {
  const isUnchanged =
    changes.length <= 1 && !changes[0]?.added && !changes[0]?.removed

  if (isUnchanged) {
    return (
      <p className="rounded-md border border-divider px-3 py-2 text-[12.5px] text-text/50">
        {messages.adminTemplates.versionDiffNoChanges}
      </p>
    )
  }

  const lines = changes.flatMap((change) =>
    change.value
      .split('\n')
      .filter((line, index, arr) => !(index === arr.length - 1 && line === ''))
      .map((line) => ({ line, added: change.added, removed: change.removed }))
  )

  return (
    <div className="overflow-hidden rounded-md border border-divider font-mono text-[12.5px] leading-relaxed">
      {lines.map((entry, index) => (
        <div
          key={index}
          className={cn(
            'px-3 py-0.5 whitespace-pre-wrap',
            entry.added && 'bg-accent/15',
            entry.removed && 'text-text/60 line-through bg-destructive/15'
          )}
        >
          {entry.line || ' '}
        </div>
      ))}
    </div>
  )
}

function DiffSection({ label, changes }: { label: string; changes: Change[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] tracking-widest text-accent uppercase">
        {label}
      </span>
      <DiffLines changes={changes} />
    </div>
  )
}

// テンプレート詳細画面：選択したバージョンと1つ前のバージョンとの差分を表示するモーダル
export function VersionDiffModal({
  templateId,
  stageKey,
  version,
  onOpenChange,
}: {
  templateId: string
  stageKey: StageKey
  version: number
  onOpenChange: (open: boolean) => void
}) {
  const [diff, setDiff] = useState<TemplateDiff | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    const emptyTemplate: StageTemplateData = {
      templateId,
      stageKey,
      title: '',
      questions: [],
      promptTemplate: '',
      qualityGateItems: [],
      version: 0,
    }

    const load = async () => {
      const after = await getStageTemplateVersion(templateId, stageKey, version)
      const before =
        version > 1
          ? await getStageTemplateVersion(templateId, stageKey, version - 1)
          : emptyTemplate

      if (cancelled) return
      if ('error' in after || 'error' in before) {
        setErrorMessage(messages.common.errorMessage.error)
        return
      }
      setDiff(buildTemplateDiff(before, after))
    }
    void load()

    return () => {
      cancelled = true
    }
  }, [templateId, stageKey, version])

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {version > 1
              ? `${messages.adminTemplates.versionDiffTitle}（v${version - 1} → v${version}）`
              : `${messages.adminTemplates.versionDiffTitle}（v${version}）`}
          </DialogTitle>
        </DialogHeader>

        {version === 1 && (
          <p className="text-[12.5px] text-text/60">
            {messages.adminTemplates.versionDiffInitialNote}
          </p>
        )}

        {errorMessage && (
          <p className="text-[13px] text-destructive">{errorMessage}</p>
        )}

        {!diff && !errorMessage && (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {diff && (
          <div className="flex flex-col gap-5">
            <DiffSection
              label={messages.adminTemplates.titleLabel}
              changes={diff.title}
            />
            <DiffSection
              label={messages.adminTemplates.questionListLabel}
              changes={diff.questions}
            />
            <DiffSection
              label={messages.adminTemplates.promptTemplateLabel}
              changes={diff.promptTemplate}
            />
            <DiffSection
              label={messages.adminTemplates.qualityGateLabel}
              changes={diff.qualityGateItems}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
