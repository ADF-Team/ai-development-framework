import { diffLines, type Change } from 'diff'
import type { TemplateQuestion, TemplateQualityGateItem } from '@/types/StageTemplate'

export interface TemplateDiff {
  title: Change[]
  questions: Change[]
  promptTemplate: Change[]
  qualityGateItems: Change[]
}

interface DiffableTemplate {
  title: string
  questions: TemplateQuestion[]
  promptTemplate: string
  qualityGateItems: TemplateQualityGateItem[]
}

/**
 * 2つのテンプレート版を比較し、テンプレート名・質問セット・プロンプトテンプレート・品質ゲート項目それぞれの行単位の差分を返す
 * @param before - 比較元（古い方）のテンプレート内容
 * @param after - 比較先（新しい方）のテンプレート内容
 */
export function buildTemplateDiff(
  before: DiffableTemplate,
  after: DiffableTemplate
): TemplateDiff {
  return {
    title: diffLines(before.title, after.title),
    questions: diffLines(
      before.questions.map((question) => question.text).join('\n'),
      after.questions.map((question) => question.text).join('\n')
    ),
    promptTemplate: diffLines(before.promptTemplate, after.promptTemplate),
    qualityGateItems: diffLines(
      before.qualityGateItems.map((item) => item.label).join('\n'),
      after.qualityGateItems.map((item) => item.label).join('\n')
    ),
  }
}
