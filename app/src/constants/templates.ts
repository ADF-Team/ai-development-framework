import { messages } from '@/constants/messages'
import type { StageKey } from '@/types/Project'

/**
 * プロンプトテンプレート冒頭の役割定義行を組み立てる
 * @param stageKey - 工程キー
 */
export function buildPromptIntroLine(stageKey: StageKey): string {
  return `あなたは${messages.stages.stageNames[stageKey]}を担当する専門家です。`
}

/**
 * プロンプトテンプレート末尾の成果物作成指示行を組み立てる
 * （案件画面の成果物生成ボタン文言 questionForm.generateDeliverableButton と表現を揃える）
 * @param stageKey - 工程キー
 */
export function buildPromptClosingLine(stageKey: StageKey): string {
  const deliverableAction =
    messages.stages.questionForm.generateDeliverableButton[stageKey]
  return `上記を踏まえ、${deliverableAction.replace(/する$/, 'してください')}。`
}

/**
 * 質問セットから、冒頭・末尾の定型文で挟んだ標準的なプロンプトテンプレートを組み立てる
 * （質問が0件の場合は定型文のみになる。新規テンプレート作成時の初期値、および工程の初期プロンプトテンプレート生成に使用）
 * @param stageKey - 工程キー
 * @param questions - 質問セット（id・text・orderを持つオブジェクトの配列）
 */
export function buildPromptTemplateFromQuestions(
  stageKey: StageKey,
  questions: { id: string; text: string; order: number }[]
): string {
  const intro = buildPromptIntroLine(stageKey)
  const closing = buildPromptClosingLine(stageKey)
  const body = questions
    .map(
      (question) =>
        `${question.order}. ${question.text}\n→ {{answer:${question.id}}}`
    )
    .join('\n\n')

  return body ? `${intro}\n${body}\n\n${closing}` : `${intro}\n\n${closing}`
}
