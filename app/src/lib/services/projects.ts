import { messages } from '@/constants/messages'
import { STAGE_ORDER, isStageKey } from '@/types/Project'
import { ServiceError } from './ServiceError'
import { STAGE_QUALITY_GATE_ITEMS, getStageTemplateContent } from './templates'
import type {
  ProjectListItem,
  ProjectDetail,
  StageKey,
  StageStatus,
  OverallStatus,
} from '@/types/Project'
import type { StageDetail, StageQuestion } from '@/types/Stage'
import type { DeliverableData } from '@/types/Deliverable'

// TODO: インフラ（Cloud SQL）準備後、Prisma経由でDBアクセスする実装に置き換える。
// 現状はプロセス内メモリのモックストアで案件・工程の状態を保持する（サーバー再起動でリセットされる）
// 各案件はtemplateId（lib/services/templates）を1つ参照し、工程ごとの質問セット・プロンプトテンプレート・
// 品質ゲート項目は常にそのテンプレートの現在有効な版から取得する（テンプレート編集は既存案件にも反映される＝ライブ参照）

interface StageRecord {
  status: StageStatus
  answers: Record<string, string>
  generatedPrompt: string
  deliverable: DeliverableData | null
  qualityGateResult: Record<string, { checked: boolean }>
}

interface ProjectRecord {
  id: string
  name: string
  templateId: string
  overallStatus: OverallStatus
  currentStage: StageKey
  createdAt: string
  stages: Record<StageKey, StageRecord>
}

function emptyStage(): StageRecord {
  return {
    status: 'not_started',
    answers: {},
    generatedPrompt: '',
    deliverable: null,
    qualityGateResult: {},
  }
}

function makeDeliverable(
  content: string,
  version: number,
  generationMethod: DeliverableData['generationMethod'],
  deliverableIdSeed: string
): DeliverableData {
  return {
    id: `${deliverableIdSeed}-v${version}`,
    version,
    content,
    generationMethod,
  }
}

function completedGate(
  stageKey: StageKey
): Record<string, { checked: boolean }> {
  return Object.fromEntries(
    STAGE_QUALITY_GATE_ITEMS[stageKey].map((item) => [
      item.id,
      { checked: true },
    ])
  )
}

const SEED_TEMPLATE_ID = 't1'

const PROJECTS = new Map<string, ProjectRecord>([
  [
    'p1',
    {
      id: 'p1',
      name: 'ECサイトリニューアル',
      templateId: SEED_TEMPLATE_ID,
      overallStatus: 'in_progress',
      currentStage: 'design',
      createdAt: '2026-06-01',
      stages: {
        requirements: {
          status: 'completed',
          answers: {
            q1: '既存ECサイトの表示速度と離脱率の悪化を解消したい。',
            q2: '一般消費者（20〜40代のオンライン購買層）',
            q3: '商品検索・カート・決済・注文履歴の刷新',
            q4: 'レコメンド表示、お気に入り機能',
            q5: '同時アクセス数の増加に耐えること、決済まわりのセキュリティ',
            q6: '本番リリースは今期末まで。予算は別途稟議済み',
            q7: '競合A社、B社のECサイト',
            q8: '前回商談の議事録に離脱率の課題が記載あり',
          },
          generatedPrompt:
            '要件定義工程のヒアリング回答をもとに生成したプロンプト（v2で確定済み）',
          deliverable: makeDeliverable(
            '# 要件定義書（ドラフト）\n\n## 背景\n既存ECサイトの表示速度と離脱率の悪化が課題。\n\n## MVP\n- 商品検索・カート・決済・注文履歴の刷新\n\n## Nice to have\n- レコメンド表示、お気に入り機能\n\n## 非機能要件\n- 同時アクセス増への耐性、決済セキュリティの強化',
            2,
            'manual',
            'p1-requirements'
          ),
          qualityGateResult: completedGate('requirements'),
        },
        design: {
          status: 'in_progress',
          answers: {
            q1: 'Next.js + Cloud Run を想定',
            q2: '商品、注文、ユーザー、カート',
            q4: '決済代行API連携予定',
          },
          generatedPrompt: '',
          deliverable: null,
          qualityGateResult: {},
        },
        implementation: emptyStage(),
        review: emptyStage(),
        security: emptyStage(),
        test: emptyStage(),
        documentation: emptyStage(),
      },
    },
  ],
  [
    'p2',
    {
      id: 'p2',
      name: '社内問い合わせBot',
      templateId: SEED_TEMPLATE_ID,
      overallStatus: 'in_progress',
      currentStage: 'security',
      createdAt: '2026-05-15',
      stages: {
        requirements: {
          status: 'completed',
          answers: {
            q1: '社内問い合わせ対応の工数削減',
            q2: '全社員',
            q3: 'Slack連携のQAボット',
            q4: '利用状況ダッシュボード',
            q5: '社内システムのみでの利用',
            q6: '3ヶ月以内',
            q7: '社内Wikiの検索機能',
            q8: '情シスからの要望メモあり',
          },
          generatedPrompt:
            '要件定義工程のヒアリング回答をもとに生成したプロンプト',
          deliverable: makeDeliverable(
            '# 要件定義書\n社内問い合わせ対応の工数削減を目的としたSlack連携QAボットを構築する。',
            1,
            'ai_executed',
            'p2-requirements'
          ),
          qualityGateResult: completedGate('requirements'),
        },
        design: {
          status: 'completed',
          answers: {
            q1: 'Next.js + Slack Bolt',
            q2: 'Q&A履歴、ナレッジ記事',
            q3: 'Slackコマンド、管理画面',
            q4: 'Slack API、社内Wiki API',
            q5: '同時100リクエスト程度',
            q6: '社内ネットワークのみ公開',
            q7: '既存API命名規則に準拠',
          },
          generatedPrompt: '設計工程のヒアリング回答をもとに生成したプロンプト',
          deliverable: makeDeliverable(
            '# 設計書\nSlack Bolt経由でQ&A履歴とナレッジ記事を検索・回答する構成。',
            1,
            'ai_executed',
            'p2-design'
          ),
          qualityGateResult: completedGate('design'),
        },
        implementation: {
          status: 'completed',
          answers: {
            q1: 'Slackコマンド部分',
            q2: 'TypeScript / Next.js 14',
            q3: '設計書v1',
            q4: '社内コーディング規約',
            q5: '既存認証基盤と共通化',
            q6: 'Slackタイムアウト時のリトライ',
          },
          generatedPrompt: '実装工程のヒアリング回答をもとに生成したプロンプト',
          deliverable: makeDeliverable(
            '# 実装メモ\nSlackコマンドハンドラと検索APIを実装。',
            1,
            'ai_executed',
            'p2-implementation'
          ),
          qualityGateResult: completedGate('implementation'),
        },
        review: {
          status: 'completed',
          answers: {
            q1: 'src/bot/handler.ts 他5ファイル',
            q2: '可読性とエラーハンドリング',
            q3: '社内コーディング規約',
            q4: 'TypeScript 5.4',
          },
          generatedPrompt:
            'レビュー工程のヒアリング回答をもとに生成したプロンプト',
          deliverable: makeDeliverable(
            '# レビュー結果\n命名の一貫性を指摘、修正済み。重大な指摘なし。',
            1,
            'ai_executed',
            'p2-review'
          ),
          qualityGateResult: completedGate('review'),
        },
        security: {
          status: 'quality_gate_pending',
          answers: {
            q1: '社内情報のみ、個人情報は含まない',
            q2: '/api/bot/query, /api/bot/history',
            q3: '@slack/bolt, next, openai-sdk',
            q4: '社内ネットワークのみ公開',
          },
          generatedPrompt:
            'セキュリティ工程のヒアリング回答をもとに生成したプロンプト',
          deliverable: makeDeliverable(
            '# セキュリティレビュー\n依存ライブラリの脆弱性スキャン結果、重大なものなし。アクセス制御を確認済み。',
            1,
            'ai_executed',
            'p2-security'
          ),
          qualityGateResult: {
            g1: { checked: true },
            g2: { checked: true },
          },
        },
        test: emptyStage(),
        documentation: emptyStage(),
      },
    },
  ],
  [
    'p3',
    {
      id: 'p3',
      name: '請求書自動化ツール',
      templateId: SEED_TEMPLATE_ID,
      overallStatus: 'in_progress',
      currentStage: 'requirements',
      createdAt: '2026-07-20',
      stages: {
        requirements: emptyStage(),
        design: emptyStage(),
        implementation: emptyStage(),
        review: emptyStage(),
        security: emptyStage(),
        test: emptyStage(),
        documentation: emptyStage(),
      },
    },
  ],
  [
    'p4',
    {
      id: 'p4',
      name: '社内ナレッジ検索',
      templateId: SEED_TEMPLATE_ID,
      overallStatus: 'completed',
      currentStage: 'documentation',
      createdAt: '2026-03-10',
      stages: {
        requirements: {
          status: 'completed',
          answers: { q1: '社内資料の検索性向上', q2: '全社員' },
          generatedPrompt:
            '要件定義工程のヒアリング回答をもとに生成したプロンプト',
          deliverable: makeDeliverable(
            '# 要件定義書\n社内資料の検索性向上が目的。',
            1,
            'manual',
            'p4-requirements'
          ),
          qualityGateResult: completedGate('requirements'),
        },
        design: {
          status: 'completed',
          answers: { q1: 'Next.js + Elasticsearch', q2: '文書、タグ、権限' },
          generatedPrompt: '設計工程のヒアリング回答をもとに生成したプロンプト',
          deliverable: makeDeliverable(
            '# 設計書\nElasticsearchによる全文検索基盤。',
            1,
            'manual',
            'p4-design'
          ),
          qualityGateResult: completedGate('design'),
        },
        implementation: {
          status: 'completed',
          answers: { q1: '検索画面一式', q2: 'TypeScript / Next.js 14' },
          generatedPrompt: '実装工程のヒアリング回答をもとに生成したプロンプト',
          deliverable: makeDeliverable(
            '# 実装メモ\n検索APIとインデクサを実装。',
            1,
            'manual',
            'p4-implementation'
          ),
          qualityGateResult: completedGate('implementation'),
        },
        review: {
          status: 'completed',
          answers: { q1: 'src/search 一式', q2: 'パフォーマンス' },
          generatedPrompt:
            'レビュー工程のヒアリング回答をもとに生成したプロンプト',
          deliverable: makeDeliverable(
            '# レビュー結果\nインデックス更新処理の最適化を実施。',
            1,
            'manual',
            'p4-review'
          ),
          qualityGateResult: completedGate('review'),
        },
        security: {
          status: 'completed',
          answers: {
            q1: '社内文書、機密情報含む',
            q2: '/api/search, /api/index',
          },
          generatedPrompt:
            'セキュリティ工程のヒアリング回答をもとに生成したプロンプト',
          deliverable: makeDeliverable(
            '# セキュリティレビュー\n権限別アクセス制御を確認、脆弱性なし。',
            1,
            'manual',
            'p4-security'
          ),
          qualityGateResult: completedGate('security'),
        },
        test: {
          status: 'completed',
          answers: { q1: '検索API仕様書', q2: '結合テスト重視' },
          generatedPrompt:
            'テスト工程のヒアリング回答をもとに生成したプロンプト',
          deliverable: makeDeliverable(
            '# テスト結果\n全シナリオパス。カバレッジ82%。',
            1,
            'manual',
            'p4-test'
          ),
          qualityGateResult: completedGate('test'),
        },
        documentation: {
          status: 'completed',
          answers: { q1: '社内エンジニア', q2: 'README、API仕様書' },
          generatedPrompt:
            'ドキュメント工程のヒアリング回答をもとに生成したプロンプト',
          deliverable: makeDeliverable(
            '# README\n社内ナレッジ検索ツールのセットアップ手順とAPI仕様。',
            1,
            'manual',
            'p4-documentation'
          ),
          qualityGateResult: completedGate('documentation'),
        },
      },
    },
  ],
])

function findProjectOrThrow(projectId: string): ProjectRecord {
  const project = PROJECTS.get(projectId)
  if (!project) {
    throw new ServiceError(404, messages.common.errorMessage.notFound)
  }
  return project
}

function findStageOrThrow(
  project: ProjectRecord,
  stageKey: string
): StageRecord {
  if (!isStageKey(stageKey)) {
    throw new ServiceError(404, messages.common.errorMessage.notFound)
  }
  return project.stages[stageKey]
}

// 案件レコードを一覧表示用アイテム（7工程分のステータスサマリー付き）に変換する
function toListItem(project: ProjectRecord): ProjectListItem {
  return {
    id: project.id,
    name: project.name,
    overallStatus: project.overallStatus,
    currentStage: project.currentStage,
    stageStatuses: Object.fromEntries(
      STAGE_ORDER.map((key) => [key, project.stages[key].status])
    ) as Record<StageKey, StageStatus>,
    createdAt: project.createdAt,
  }
}

// 質問への回答をプロンプトテンプレートに埋め込んでプロンプト文を組み立てる
function buildPrompt(
  stageKey: StageKey,
  questions: StageQuestion[],
  answers: Record<string, string>
): string {
  const stageName = messages.stages.stageNames[stageKey]
  const lines = [
    `あなたは${stageName}を担当する専門家です。以下のヒアリング回答をもとに、${stageName}工程の成果物を作成してください。`,
    '',
  ]
  questions.forEach((question, index) => {
    const answer = answers[question.id]
    if (answer) {
      lines.push(`${index + 1}. ${question.text}`, `→ ${answer}`, '')
    }
  })
  lines.push(
    '上記を踏まえ、実務で使えるレベルの成果物をMarkdown形式で出力してください。'
  )
  return lines.join('\n')
}

/**
 * 案件一覧を、各案件の7工程分のステータスサマリー付きで取得する
 */
export function listProjects(): ProjectListItem[] {
  return Array.from(PROJECTS.values()).map(toListItem)
}

/**
 * 指定テンプレートを参照している進行中の案件一覧を取得する（テンプレート編集時の影響確認用）
 * @param templateId - テンプレートID
 */
export function listInProgressProjectsByTemplate(
  templateId: string
): { id: string; name: string }[] {
  return Array.from(PROJECTS.values())
    .filter(
      (project) =>
        project.templateId === templateId &&
        project.overallStatus === 'in_progress'
    )
    .map((project) => ({ id: project.id, name: project.name }))
}

/**
 * 案件を作成する（選択したテンプレートを参照する状態で、7工程分のレコードを一括作成する）
 * @param name - 案件名
 * @param templateId - 参照するテンプレートID
 */
export function createProject(
  name: string,
  templateId: string
): ProjectListItem {
  // テンプレートの存在確認（工程1の内容取得を試みることで検証する）
  getStageTemplateContent(templateId, STAGE_ORDER[0])

  const id = `p${Date.now()}`
  const stages = Object.fromEntries(
    STAGE_ORDER.map((stageKey) => [stageKey, emptyStage()])
  ) as Record<StageKey, StageRecord>
  stages.requirements.status = 'in_progress'

  const project: ProjectRecord = {
    id,
    name,
    templateId,
    overallStatus: 'in_progress',
    currentStage: 'requirements',
    createdAt: new Date().toISOString().slice(0, 10),
    stages,
  }
  PROJECTS.set(id, project)

  return toListItem(project)
}

/**
 * 案件詳細（工程別ステータス一覧含む）を取得する
 * @param projectId - 案件ID
 */
export function getProjectDetail(projectId: string): ProjectDetail {
  const project = findProjectOrThrow(projectId)
  return {
    id: project.id,
    name: project.name,
    overallStatus: project.overallStatus,
    currentStage: project.currentStage,
    stages: STAGE_ORDER.map((stageKey) => ({
      stageKey,
      status: project.stages[stageKey].status,
    })),
  }
}

/**
 * 特定工程の質問・回答・プロンプト・成果物・品質ゲート状況を取得する
 * （質問セット・品質ゲート項目は、案件が参照するテンプレートの現在有効な版から取得する）
 * @param projectId - 案件ID
 * @param stageKey - 工程キー
 */
export function getStageDetail(
  projectId: string,
  stageKey: string
): StageDetail {
  const project = findProjectOrThrow(projectId)
  const stage = findStageOrThrow(project, stageKey)
  const key = stageKey as StageKey
  const template = getStageTemplateContent(project.templateId, key)
  return {
    stageKey: key,
    status: stage.status,
    questions: template.questions,
    answers: stage.answers,
    generatedPrompt: stage.generatedPrompt,
    deliverable: stage.deliverable,
    qualityGateItems: template.qualityGateItems,
    qualityGateResult: stage.qualityGateResult,
  }
}

/**
 * 工程の質問への回答を保存する
 * @param projectId - 案件ID
 * @param stageKey - 工程キー
 * @param answers - 質問ID→回答のマップ
 */
export function saveStageAnswers(
  projectId: string,
  stageKey: string,
  answers: Record<string, string>
): { projectStageId: string; status: StageStatus } {
  const project = findProjectOrThrow(projectId)
  const stage = findStageOrThrow(project, stageKey)

  stage.answers = { ...stage.answers, ...answers }
  const hasAnswer = Object.values(stage.answers).some(
    (value) => value.trim() !== ''
  )
  if (stage.status === 'not_started' && hasAnswer) {
    stage.status = 'in_progress'
  }

  return { projectStageId: `${projectId}-${stageKey}`, status: stage.status }
}

/**
 * 保存済みの回答をプロンプトテンプレートに埋め込み、プロンプトを生成する
 * @param projectId - 案件ID
 * @param stageKey - 工程キー
 */
export function generateStagePrompt(
  projectId: string,
  stageKey: string
): { generatedPrompt: string } {
  const project = findProjectOrThrow(projectId)
  const stage = findStageOrThrow(project, stageKey)
  const key = stageKey as StageKey

  const hasAnswer = Object.values(stage.answers).some(
    (value) => value.trim() !== ''
  )
  if (!hasAnswer) {
    throw new ServiceError(409, messages.common.errorMessage.conflict)
  }

  const template = getStageTemplateContent(project.templateId, key)
  stage.generatedPrompt = buildPrompt(key, template.questions, stage.answers)
  return { generatedPrompt: stage.generatedPrompt }
}

/**
 * Claude APIを呼び出し、生成プロンプトから成果物を生成・保存する（アプリ内実行時のみ）
 * @param projectId - 案件ID
 * @param stageKey - 工程キー
 */
export function executeStage(
  projectId: string,
  stageKey: string
): {
  deliverableId: string
  version: number
  content: string
  generationMethod: DeliverableData['generationMethod']
  tokensUsed: { input: number; output: number }
} {
  const project = findProjectOrThrow(projectId)
  const stage = findStageOrThrow(project, stageKey)
  const key = stageKey as StageKey

  if (!stage.generatedPrompt) {
    throw new ServiceError(409, messages.common.errorMessage.conflict)
  }

  // TODO: Anthropic API呼び出しに置き換える。現状は回答内容から簡易的な成果物を組み立てるモック
  const stageName = messages.stages.stageNames[key]
  const template = getStageTemplateContent(project.templateId, key)
  const content = [
    `# ${stageName}工程の成果物`,
    '',
    ...template.questions
      .filter((question) => stage.answers[question.id])
      .map((question) => `## ${question.text}\n${stage.answers[question.id]}`),
  ].join('\n')

  const version = (stage.deliverable?.version ?? 0) + 1
  stage.deliverable = makeDeliverable(
    content,
    version,
    'ai_executed',
    `${projectId}-${stageKey}`
  )
  if (stage.status === 'in_progress' || stage.status === 'not_started') {
    stage.status = 'quality_gate_pending'
  }

  return {
    deliverableId: stage.deliverable.id,
    version: stage.deliverable.version,
    content: stage.deliverable.content,
    generationMethod: stage.deliverable.generationMethod,
    tokensUsed: { input: 1200, output: 800 },
  }
}

/**
 * 成果物を保存・編集する（プロンプトのみモードでの貼り付け／既存成果物の編集の両方に使用）
 * @param projectId - 案件ID
 * @param stageKey - 工程キー
 * @param content - 保存する成果物本文
 */
export function saveDeliverable(
  projectId: string,
  stageKey: string,
  content: string
): {
  deliverableId: string
  version: number
  generationMethod: DeliverableData['generationMethod']
} {
  const project = findProjectOrThrow(projectId)
  const stage = findStageOrThrow(project, stageKey)

  const version = (stage.deliverable?.version ?? 0) + 1
  stage.deliverable = makeDeliverable(
    content,
    version,
    'manual',
    `${projectId}-${stageKey}`
  )
  if (stage.status === 'in_progress' || stage.status === 'not_started') {
    stage.status = 'quality_gate_pending'
  }

  return {
    deliverableId: stage.deliverable.id,
    version: stage.deliverable.version,
    generationMethod: stage.deliverable.generationMethod,
  }
}

/**
 * 品質ゲートのチェック結果を保存し、通過判定・次工程への移行を行う
 * @param projectId - 案件ID
 * @param stageKey - 工程キー
 * @param checkedItemIds - チェック済みの品質ゲート項目ID一覧
 */
export function submitQualityGate(
  projectId: string,
  stageKey: string,
  checkedItemIds: string[]
):
  | { passed: true; nextStage: StageKey | null; projectCompleted: boolean }
  | { passed: false; missingItemIds: string[] } {
  const project = findProjectOrThrow(projectId)
  const stage = findStageOrThrow(project, stageKey)
  const key = stageKey as StageKey
  const items = getStageTemplateContent(
    project.templateId,
    key
  ).qualityGateItems

  stage.qualityGateResult = Object.fromEntries(
    items.map((item) => [
      item.id,
      { checked: checkedItemIds.includes(item.id) },
    ])
  )

  const missingItemIds = items
    .filter((item) => !checkedItemIds.includes(item.id))
    .map((item) => item.id)

  if (missingItemIds.length > 0) {
    return { passed: false, missingItemIds }
  }

  stage.status = 'completed'
  const currentIndex = STAGE_ORDER.indexOf(key)
  const nextStageKey = STAGE_ORDER[currentIndex + 1] ?? null

  if (nextStageKey) {
    const nextStage = project.stages[nextStageKey]
    if (nextStage.status === 'not_started') {
      nextStage.status = 'in_progress'
    }
    project.currentStage = nextStageKey
    return { passed: true, nextStage: nextStageKey, projectCompleted: false }
  }

  project.overallStatus = 'completed'
  return { passed: true, nextStage: null, projectCompleted: true }
}
