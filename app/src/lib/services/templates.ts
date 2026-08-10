import { messages } from '@/constants/messages'
import { STAGE_ORDER, isStageKey } from '@/types/Project'
import { buildPromptTemplateFromQuestions } from '@/constants/templates'
import { ServiceError } from './ServiceError'
import type { StageKey } from '@/types/Project'
import type { StageQuestion, QualityGateItem } from '@/types/Stage'
import type {
  StageTemplateData,
  StageTemplateDetail,
  TemplateQuestion,
  TemplateQualityGateItem,
  TemplateSummary,
  TemplateVersionSummary,
} from '@/types/StageTemplate'
import type {
  PublishedTemplateDetail,
  PublishedTemplateSummary,
} from '@/types/PublishedTemplate'

// TODO: インフラ（Cloud SQL）準備後、Prisma経由でDBアクセスする実装に置き換える。
// 現状はプロセス内メモリのモックストアでテンプレート（7工程分の質問セット・プロンプトテンプレート・品質ゲート項目をまとめて持つパック）を保持する。
// 1つのテンプレートは複数作成でき、案件は作成時に選んだテンプレートを常に最新版で参照し続ける（lib/services/projectsのgetStageDetail等から参照される）。

interface StageContent {
  questions: TemplateQuestion[]
  promptTemplate: string
  qualityGateItems: TemplateQualityGateItem[]
}

interface TemplateVersionRecord {
  version: number
  createdAt: string
  createdBy: string
  title: string
  stages: Record<StageKey, StageContent>
}

export const STAGE_QUESTIONS: Record<StageKey, StageQuestion[]> = {
  requirements: [
    { id: 'q1', order: 1, text: 'この案件の目的・解決したい課題は何ですか？' },
    { id: 'q2', order: 2, text: '想定ユーザー（利用者）は誰ですか？' },
    {
      id: 'q3',
      order: 3,
      text: '必須機能（MVP）は何ですか？箇条書きで教えてください',
    },
    {
      id: 'q4',
      order: 4,
      text: 'あれば嬉しい機能（Nice to have）はありますか？',
    },
    {
      id: 'q5',
      order: 5,
      text: '非機能要件（性能・セキュリティ・可用性等）で気にすべき点はありますか？',
    },
    { id: 'q6', order: 6, text: '納期・予算の制約はありますか？' },
    {
      id: 'q7',
      order: 7,
      text: '参考にしたい既存サービス・競合はありますか？',
    },
    {
      id: 'q8',
      order: 8,
      text: '顧客から受け取っている資料や議事録の要点があれば教えてください',
    },
  ],
  design: [
    {
      id: 'q1',
      order: 1,
      text: '使用する技術スタック（言語・フレームワーク）は決まっていますか？',
    },
    {
      id: 'q2',
      order: 2,
      text: '主要なデータエンティティ（登場する「モノ」）は何ですか？',
    },
    {
      id: 'q3',
      order: 3,
      text: '想定される画面・機能一覧は？（要件定義書から引用可）',
    },
    { id: 'q4', order: 4, text: '外部連携するシステム・APIはありますか？' },
    {
      id: 'q5',
      order: 5,
      text: '想定同時接続数・データ量などのスケール感は？',
    },
    {
      id: 'q6',
      order: 6,
      text: '特にセキュリティ・権限管理で気をつけたい点は？',
    },
    {
      id: 'q7',
      order: 7,
      text: '既存の設計規約・命名規則があれば教えてください',
    },
    {
      id: 'q8',
      order: 8,
      text: 'UI／デザインの方向性はありますか？（既存のブランドガイドライン、参考にしたいデザインテイスト、ダーク/ライトモードの要否、既存デザインシステム・UIライブラリの指定など）',
    },
    {
      id: 'q9',
      order: 9,
      text: 'デバイス対応の範囲は？（PC専用／レスポンシブ対応／モバイルアプリ相当の対応が必要か）',
    },
  ],
  implementation: [
    {
      id: 'q1',
      order: 1,
      text: '実装するのは全体のうちどの機能・画面ですか？',
    },
    {
      id: 'q2',
      order: 2,
      text: '使用する言語・フレームワーク・バージョンは？',
    },
    { id: 'q3', order: 3, text: '参照すべき設計書・API仕様は？' },
    {
      id: 'q4',
      order: 4,
      text: '自社のコーディング規約・スタイルガイドはありますか？',
    },
    { id: 'q5', order: 5, text: '既存コードとの整合性で気をつけるべき点は？' },
    {
      id: 'q6',
      order: 6,
      text: '特に注意すべきエッジケース・例外処理はありますか？',
    },
  ],
  review: [
    { id: 'q1', order: 1, text: 'レビュー対象のコード（ファイル・差分）は？' },
    {
      id: 'q2',
      order: 2,
      text: '重点的に見てほしい観点は？（可読性／パフォーマンス／セキュリティ等）',
    },
    { id: 'q3', order: 3, text: '遵守すべきコーディング規約は？' },
    { id: 'q4', order: 4, text: '対象の言語・フレームワークのバージョンは？' },
  ],
  security: [
    {
      id: 'q1',
      order: 1,
      text: '対象システムの用途・扱うデータの機微性は？（個人情報の有無等）',
    },
    { id: 'q2', order: 2, text: '対象コード・エンドポイント一覧は？' },
    { id: 'q3', order: 3, text: '使用しているライブラリ・依存関係の一覧は？' },
    { id: 'q4', order: 4, text: '外部公開の有無、想定される攻撃経路は？' },
  ],
  test: [
    { id: 'q1', order: 1, text: 'テスト対象の機能・仕様書は？' },
    {
      id: 'q2',
      order: 2,
      text: '単体テスト／結合テストどちらを重視しますか？',
    },
    { id: 'q3', order: 3, text: '使用するテストフレームワークは？' },
    { id: 'q4', order: 4, text: '特に網羅したい異常系・境界値は？' },
  ],
  documentation: [
    {
      id: 'q1',
      order: 1,
      text: 'ドキュメントの対象読者は？（社内エンジニア／顧客／両方）',
    },
    {
      id: 'q2',
      order: 2,
      text: '生成したいドキュメント種別は？（README／API仕様書／DB設計書等）',
    },
    { id: 'q3', order: 3, text: '参照すべきソースコード・設計書は？' },
    {
      id: 'q4',
      order: 4,
      text: '既存のドキュメントフォーマット・テンプレートはありますか？',
    },
  ],
}

export const STAGE_QUALITY_GATE_ITEMS: Record<StageKey, QualityGateItem[]> = {
  requirements: [
    { id: 'g1', order: 1, label: '必須機能（MVP）が明記されている' },
    { id: 'g2', order: 2, label: '想定ユーザーが明確になっている' },
    {
      id: 'g3',
      order: 3,
      label: '非機能要件（性能・セキュリティ等）に抜け漏れがない',
    },
    { id: 'g4', order: 4, label: '要件間の矛盾がない' },
    {
      id: 'g5',
      order: 5,
      label: '顧客・関係者の合意が取れている（社内案件の場合は担当者承認）',
    },
  ],
  design: [
    {
      id: 'g1',
      order: 1,
      label: '要件定義書の機能がすべて設計に反映されている',
    },
    { id: 'g2', order: 2, label: 'DB設計に矛盾・重複がない' },
    { id: 'g3', order: 3, label: 'API設計が命名規則・構成標準に沿っている' },
    { id: 'g4', order: 4, label: 'セキュリティ・権限周りの設計に漏れがない' },
    {
      id: 'g5',
      order: 5,
      label: '拡張性・パフォーマンス面のリスクが検討されている',
    },
    {
      id: 'g6',
      order: 6,
      label:
        'UI／デザインの方向性が定義されている（既存デザインとの整合性、または新規デザイン方針の決定が明記されている）',
    },
  ],
  implementation: [
    {
      id: 'g1',
      order: 1,
      label:
        '設計書通りに実装されている（差分がない、または差分理由が説明されている）',
    },
    { id: 'g2', order: 2, label: 'コーディング規約に違反していない' },
    { id: 'g3', order: 3, label: '主要な異常系・エッジケースが考慮されている' },
    { id: 'g4', order: 4, label: 'ビルド・Lintが通る' },
  ],
  review: [
    {
      id: 'g1',
      order: 1,
      label:
        '可読性・命名に関する指摘がすべて解消（または対応方針が決定）されている',
    },
    { id: 'g2', order: 2, label: 'リファクタリング提案が確認済み' },
    { id: 'g3', order: 3, label: 'レビュー指摘のうち重大なものがゼロ' },
  ],
  security: [
    { id: 'g1', order: 1, label: 'OWASP Top 10観点での重大な脆弱性がゼロ' },
    { id: 'g2', order: 2, label: '依存ライブラリに既知の重大脆弱性がない' },
    {
      id: 'g3',
      order: 3,
      label: '検出された指摘が重要度別に整理され、対応方針が決まっている',
    },
  ],
  test: [
    { id: 'g1', order: 1, label: '主要機能に対する単体テストが存在する' },
    { id: 'g2', order: 2, label: '結合テストで想定シナリオがカバーされている' },
    { id: 'g3', order: 3, label: 'テストがすべてパスしている' },
    { id: 'g4', order: 4, label: 'カバレッジが一定水準に達している' },
  ],
  documentation: [
    {
      id: 'g1',
      order: 1,
      label: 'README・API仕様書・DB設計書が最新のコード・設計と一致している',
    },
    {
      id: 'g2',
      order: 2,
      label: '対象読者（社内／顧客）に応じた記述レベルになっている',
    },
    { id: 'g3', order: 3, label: '誤字脱字・欠落セクションがない' },
  ],
}

const REQUIREMENTS_PROMPT_TEMPLATE = `あなたは経験豊富なITコンサルタント兼PMです。以下のヒアリング回答をもとに、この案件の要件定義書を作成してください。

## ヒアリング回答

**1. 案件の目的・解決したい課題**
{{answer:q1}}

**2. 想定ユーザー**
{{answer:q2}}

**3. 必須機能（MVP）**
{{answer:q3}}

**4. あれば嬉しい機能（Nice to have）**
{{answer:q4}}

**5. 非機能要件**
{{answer:q5}}

**6. 納期・予算の制約**
{{answer:q6}}

**7. 参考にしたい既存サービス・競合**
{{answer:q7}}

**8. 顧客資料・議事録の要点**
{{answer:q8}}

## 作成する要件定義書の構成

以下の構成で、Markdown形式の要件定義書を作成してください。

1. 背景・目的
2. 想定ユーザー
3. 機能要件一覧（MVP／Nice to haveを分けて、表形式で）
4. 非機能要件
5. 制約条件（納期・予算等）
6. 競合・参考サービスとの差別化ポイント（該当する場合のみ）
7. 未確定事項・要確認事項

## 遵守事項

- ヒアリング回答に書かれていない情報を、勝手に推測して補完しないこと。不明な点は「7. 未確定事項・要確認事項」に列挙すること
- 機能要件は、実装担当者が読んで迷わないレベルの具体性で記述すること
- 要件間に矛盾がある場合は、補完せずその旨を指摘すること
- 想定ユーザーが曖昧な場合は、断定せずその旨を明記すること

## 品質チェック（このドキュメントが満たすべき基準）

作成後、以下を満たしているか自己チェックし、満たしていない項目があれば文書の末尾に明示すること。
- [ ] 必須機能（MVP）が明記されている
- [ ] 想定ユーザーが明確になっている
- [ ] 非機能要件に抜け漏れがない
- [ ] 要件間の矛盾がない
- [ ] 顧客・関係者の合意状況が分かる（未確認なら「要確認」と明記）`

// 質問セットから、回答プレースホルダー付きの標準的なプロンプトテンプレートを組み立てる（要件定義以外の初期値として使用）
function buildDefaultPromptTemplate(stageKey: StageKey): string {
  return buildPromptTemplateFromQuestions(stageKey, STAGE_QUESTIONS[stageKey])
}

const DEFAULT_STAGES: Record<StageKey, StageContent> = Object.fromEntries(
  STAGE_ORDER.map((stageKey) => [
    stageKey,
    {
      questions: STAGE_QUESTIONS[stageKey],
      promptTemplate:
        stageKey === 'requirements'
          ? REQUIREMENTS_PROMPT_TEMPLATE
          : buildDefaultPromptTemplate(stageKey),
      qualityGateItems: STAGE_QUALITY_GATE_ITEMS[stageKey],
    },
  ])
) as Record<StageKey, StageContent>

const TEMPLATES = new Map<string, TemplateVersionRecord[]>([
  [
    't1',
    [
      {
        version: 3,
        createdAt: '2026-07-10',
        createdBy: '山田',
        title: '標準テンプレート',
        stages: DEFAULT_STAGES,
      },
      {
        version: 2,
        createdAt: '2026-05-02',
        createdBy: '田中',
        title: '標準テンプレート',
        stages: DEFAULT_STAGES,
      },
      {
        version: 1,
        createdAt: '2026-02-14',
        createdBy: '山田',
        title: '標準テンプレート',
        stages: DEFAULT_STAGES,
      },
    ],
  ],
  [
    't2',
    [
      {
        version: 1,
        createdAt: '2026-03-01',
        createdBy: '田中',
        title: '簡易テンプレート（社内小規模案件用）',
        stages: DEFAULT_STAGES,
      },
    ],
  ],
])

interface PublishState {
  publishedAt: string | null
  sourcePublishedTemplateId: string | null
}

// テンプレートの公開状態（templates.published_at / source_published_template_id相当）。TEMPLATESと同じキー（テンプレートID）で管理する
const TEMPLATE_PUBLISH_STATE = new Map<string, PublishState>([
  ['t1', { publishedAt: '2026-07-10', sourcePublishedTemplateId: null }],
  ['t2', { publishedAt: '2026-03-01', sourcePublishedTemplateId: null }],
])

function getPublishState(templateId: string): PublishState {
  return (
    TEMPLATE_PUBLISH_STATE.get(templateId) ?? {
      publishedAt: null,
      sourcePublishedTemplateId: null,
    }
  )
}

function findVersionsOrThrow(templateId: string): TemplateVersionRecord[] {
  const versions = TEMPLATES.get(templateId)
  if (!versions) {
    throw new ServiceError(404, messages.common.errorMessage.notFound)
  }
  return versions
}

function assertStageKey(stageKey: string): asserts stageKey is StageKey {
  if (!isStageKey(stageKey)) {
    throw new ServiceError(404, messages.common.errorMessage.notFound)
  }
}

function currentVersion(
  versions: TemplateVersionRecord[]
): TemplateVersionRecord {
  return versions.reduce((latest, version) =>
    version.version > latest.version ? version : latest
  )
}

function toVersionSummaries(
  versions: TemplateVersionRecord[]
): TemplateVersionSummary[] {
  return versions
    .map(({ version, createdAt, createdBy }) => ({
      version,
      createdAt,
      createdBy,
    }))
    .sort((a, b) => b.version - a.version)
}

/**
 * テンプレート（7工程分のパック）一覧を取得する（マイテンプレート一覧画面用）
 */
export function listTemplates(): TemplateSummary[] {
  return Array.from(TEMPLATES.entries()).map(([id, versions]) => {
    const current = currentVersion(versions)
    const publishState = getPublishState(id)
    return {
      id,
      title: current.title,
      version: current.version,
      updatedAt: current.createdAt,
      updatedBy: current.createdBy,
      isPublished: publishState.publishedAt !== null,
      showPublishedTag:
        publishState.sourcePublishedTemplateId !== null &&
        versions.length === 1,
    }
  })
}

/**
 * 新規テンプレート（7工程分のパック）を作成する。各工程は空の内容で初期化される
 * @param payload - 作成するテンプレートの名前
 */
export function createTemplate(payload: { title: string }): {
  id: string
  version: number
} {
  const id = `t${Date.now()}`
  const emptyStages = Object.fromEntries(
    STAGE_ORDER.map((stageKey): [StageKey, StageContent] => [
      stageKey,
      {
        questions: [],
        promptTemplate: buildPromptTemplateFromQuestions(stageKey, []),
        qualityGateItems: [],
      },
    ])
  ) as Record<StageKey, StageContent>

  // TODO: getCurrentUser()実装後、実際のログインユーザーのdisplayNameに置き換える
  TEMPLATES.set(id, [
    {
      version: 1,
      createdAt: new Date().toISOString().slice(0, 10),
      createdBy: '山田',
      title: payload.title,
      stages: emptyStages,
    },
  ])
  TEMPLATE_PUBLISH_STATE.set(id, {
    publishedAt: null,
    sourcePublishedTemplateId: null,
  })

  return { id, version: 1 }
}

/**
 * テンプレートを複製する（現在有効な版の内容をコピーした新規テンプレートを作成する。バージョン履歴・IDは引き継がない）。
 * 複製元が公開テンプレートの場合、複製先の複製元IDを記録する（公開テンプレート詳細画面の「マイテンプレートに追加」もこの関数を使う）
 * @param templateId - 複製元のテンプレートID
 */
export function duplicateTemplate(templateId: string): {
  id: string
  version: number
} {
  const versions = findVersionsOrThrow(templateId)
  const current = currentVersion(versions)
  const sourcePublishState = getPublishState(templateId)

  const id = `t${Date.now()}`
  // TODO: getCurrentUser()実装後、実際のログインユーザーのdisplayNameに置き換える
  TEMPLATES.set(id, [
    {
      version: 1,
      createdAt: new Date().toISOString().slice(0, 10),
      createdBy: '山田',
      title: `${current.title}のコピー`,
      stages: structuredClone(current.stages),
    },
  ])
  TEMPLATE_PUBLISH_STATE.set(id, {
    publishedAt: null,
    sourcePublishedTemplateId:
      sourcePublishState.publishedAt !== null ? templateId : null,
  })

  return { id, version: 1 }
}

/**
 * テンプレートを公開状態にする（既に公開済みの場合は何もしない）
 * @param templateId - テンプレートID
 */
export function publishTemplate(templateId: string): {
  id: string
  publishedAt: string | null
} {
  findVersionsOrThrow(templateId)
  const state = getPublishState(templateId)
  if (state.publishedAt === null) {
    TEMPLATE_PUBLISH_STATE.set(templateId, {
      ...state,
      publishedAt: new Date().toISOString().slice(0, 10),
    })
  }
  return {
    id: templateId,
    publishedAt: getPublishState(templateId).publishedAt,
  }
}

/**
 * テンプレートを非公開状態に戻す（既に非公開の場合は何もしない）
 * @param templateId - テンプレートID
 */
export function unpublishTemplate(templateId: string): {
  id: string
  publishedAt: string | null
} {
  findVersionsOrThrow(templateId)
  const state = getPublishState(templateId)
  TEMPLATE_PUBLISH_STATE.set(templateId, { ...state, publishedAt: null })
  return { id: templateId, publishedAt: null }
}

/**
 * 公開中のテンプレート一覧を取得する（公開テンプレート一覧画面用）
 */
export function listPublishedTemplates(): PublishedTemplateSummary[] {
  return Array.from(TEMPLATES.entries())
    .filter(([id]) => getPublishState(id).publishedAt !== null)
    .map(([id, versions]) => {
      const current = currentVersion(versions)
      return {
        id,
        title: current.title,
        version: current.version,
        publishedAt: getPublishState(id).publishedAt as string,
      }
    })
}

/**
 * 公開テンプレートの詳細（現在有効な版の7工程分の内容）を取得する。非公開の場合は404
 * @param templateId - テンプレートID
 */
export function getPublishedTemplateDetail(
  templateId: string
): PublishedTemplateDetail {
  const versions = findVersionsOrThrow(templateId)
  const state = getPublishState(templateId)
  if (state.publishedAt === null) {
    throw new ServiceError(404, messages.common.errorMessage.notFound)
  }
  const current = currentVersion(versions)

  return {
    id: templateId,
    title: current.title,
    version: current.version,
    publishedAt: state.publishedAt,
    stages: STAGE_ORDER.map((stageKey) => ({
      stageKey,
      questions: current.stages[stageKey].questions,
      promptTemplate: current.stages[stageKey].promptTemplate,
      qualityGateItems: current.stages[stageKey].qualityGateItems,
    })),
  }
}

/**
 * 指定テンプレートの指定工程の内容（質問セット・プロンプトテンプレート・品質ゲート項目、現在有効な版）を取得する。
 * 案件の工程詳細取得時に、案件が参照しているテンプレートの最新内容として使用する
 * @param templateId - テンプレートID
 * @param stageKey - 工程キー
 */
export function getStageTemplateContent(
  templateId: string,
  stageKey: string
): StageContent {
  const versions = findVersionsOrThrow(templateId)
  assertStageKey(stageKey)
  return currentVersion(versions).stages[stageKey]
}

/**
 * テンプレート名・特定工程の質問セット・プロンプトテンプレート・品質ゲート項目（現在有効な版）とバージョン履歴を取得する
 * @param templateId - テンプレートID
 * @param stageKey - 工程キー
 */
export function getStageTemplate(
  templateId: string,
  stageKey: string
): StageTemplateDetail {
  const versions = findVersionsOrThrow(templateId)
  assertStageKey(stageKey)
  const current = currentVersion(versions)
  const stage = current.stages[stageKey]

  return {
    templateId,
    stageKey,
    title: current.title,
    questions: stage.questions,
    promptTemplate: stage.promptTemplate,
    qualityGateItems: stage.qualityGateItems,
    version: current.version,
    versions: toVersionSummaries(versions),
  }
}

/**
 * テンプレート名・特定工程の質問セット・プロンプトテンプレート・品質ゲート項目を新バージョンとして追記保存する
 * （他の工程の内容は直前バージョンから引き継がれる）
 * @param templateId - テンプレートID
 * @param stageKey - 工程キー
 * @param payload - 保存するテンプレート名・質問セット・プロンプトテンプレート・品質ゲート項目
 */
export function updateStageTemplate(
  templateId: string,
  stageKey: string,
  payload: {
    title: string
    questions: TemplateQuestion[]
    promptTemplate: string
    qualityGateItems: TemplateQualityGateItem[]
  }
): { version: number } {
  const versions = findVersionsOrThrow(templateId)
  assertStageKey(stageKey)
  const current = currentVersion(versions)
  const nextVersion = Math.max(...versions.map((v) => v.version)) + 1

  // TODO: getCurrentUser()実装後、実際のログインユーザーのdisplayNameに置き換える
  versions.push({
    version: nextVersion,
    createdAt: new Date().toISOString().slice(0, 10),
    createdBy: '山田',
    title: payload.title,
    stages: {
      ...current.stages,
      [stageKey]: {
        questions: payload.questions,
        promptTemplate: payload.promptTemplate,
        qualityGateItems: payload.qualityGateItems,
      },
    },
  })

  return { version: nextVersion }
}

/**
 * テンプレートの特定バージョン・特定工程の内容を取得する（バージョン履歴の差分表示用）
 * @param templateId - テンプレートID
 * @param stageKey - 工程キー
 * @param version - バージョン番号
 */
export function getStageTemplateVersion(
  templateId: string,
  stageKey: string,
  version: number
): StageTemplateData {
  const versions = findVersionsOrThrow(templateId)
  assertStageKey(stageKey)
  const record = versions.find((v) => v.version === version)
  if (!record) {
    throw new ServiceError(404, messages.common.errorMessage.notFound)
  }
  const stage = record.stages[stageKey]

  return {
    templateId,
    stageKey,
    title: record.title,
    questions: stage.questions,
    promptTemplate: stage.promptTemplate,
    qualityGateItems: stage.qualityGateItems,
    version: record.version,
  }
}
