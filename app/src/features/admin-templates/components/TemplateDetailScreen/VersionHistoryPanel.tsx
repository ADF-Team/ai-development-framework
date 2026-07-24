import { useState } from 'react'
import { PanelCard, PanelCardKicker } from '@/components/card/PanelCard'
import { Tag } from '@/components/tag/Tag'
import { messages } from '@/constants/messages'
import { VersionDiffModal } from './VersionHistoryPanel/VersionDiffModal'
import type { StageKey } from '@/types/Project'
import type { TemplateVersionSummary } from '@/types/StageTemplate'

// テンプレート詳細画面：過去バージョンの確認（クリックで1つ前のバージョンとの差分を表示する）
export function VersionHistoryPanel({
  templateId,
  stageKey,
  versions,
  currentVersion,
}: {
  templateId: string
  stageKey: StageKey
  versions: TemplateVersionSummary[]
  currentVersion: number
}) {
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null)

  return (
    <PanelCard>
      <PanelCardKicker>
        {messages.adminTemplates.versionHistoryLabel}
      </PanelCardKicker>
      <div className="flex flex-col">
        {versions.map((version) => (
          <button
            key={version.version}
            type="button"
            className="border-b border-divider py-2 text-left hover:bg-accent/8"
            onClick={() => setSelectedVersion(version.version)}
          >
            <div className="flex items-center gap-1.5 text-[13px]">
              v{version.version}
              {version.version === currentVersion && (
                <Tag className="bg-accent-800 text-accent-100">
                  {messages.adminTemplates.currentVersionTag}
                </Tag>
              )}
            </div>
            <div className="text-[11px] text-text/60">
              {version.createdAt}・{version.createdBy}
            </div>
          </button>
        ))}
      </div>

      {selectedVersion !== null && (
        <VersionDiffModal
          templateId={templateId}
          stageKey={stageKey}
          version={selectedVersion}
          onOpenChange={(open) => {
            if (!open) setSelectedVersion(null)
          }}
        />
      )}
    </PanelCard>
  )
}
