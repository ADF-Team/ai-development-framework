import { STAGES, buildGeneratedPrompt } from './adfStages.mjs'

const PROJECT_ID = '00000000-0000-0000-0000-000000000201'
const PROJECT_NAME = 'AI Development Framework（ADF）Webアプリ開発'

// 工程キー → project_stages/deliverables のUUID接尾辞
const STAGE_ROW_SUFFIX = {
  requirements: '1',
  design: '2',
  implementation: '3',
  review: '4',
  security: '5',
  test: '6',
  documentation: '7',
}

// このプロジェクト（ADF自身の開発）を、ADFのヒアリング回答として記録した実際の内容（docs/README.md・app/CLAUDE.md・docs/TODO.mdを正本として要約）
const ANSWERS = {
  requirements: {
    'req-1':
      '企画書で提案した「AI Development Framework（ADF）」を、PoCの検証ツールではなく実際に使えるWebアプリとして実装し、ADFという会社の資産そのものを動かす基盤を作ること。将来的には他社へのライセンス提供も視野に入れる。',
    'req-2':
      '利用者（エンジニア）・管理者・システム管理者の3ロール。v1では自社（単一組織）のエンジニアが利用者と管理者を兼務する運用を想定する。',
    'req-3':
      'F1 案件管理／F2 工程別ガイド付き質問フォーム／F3 プロンプト自動生成／F4 実行モード切り替え（プロンプトのみ出力・アプリ内AI実行）／F5 成果物の保存・編集／F6 品質ゲート制御／F7 マイテンプレート（質問セット・プロンプトテンプレート・品質ゲート項目の管理、バージョン履歴）／F8 認証／F9 ユーザー管理',
    'req-4':
      'F10 テンプレート公開／F11 公開テンプレートの複製／F12 会社管理（将来の他社ライセンス提供を見据えたシステム管理者機能）。v1でも実装対象に含めるが、優先度はF1〜F9の後段。',
    'req-5':
      'Anthropic APIキーはサーバー側のみで保持しクライアントに露出させないこと。セッションはhttpOnlyのCookieで管理すること。組織（organization_id）単位でデータをスコープ分離し、他組織のデータに一切アクセスできないこと。性能・可用性は社内複数人規模の利用が前提のため、厳密なSLAは設けずまずは正しく動くことを優先する。',
    'req-6':
      '外部顧客向けの納期は無く、社内資産として継続的に開発していく前提。v1では実装速度を優先し、自動テストの整備やAnthropic API・Identity Platformの本連携は後回しにしてよいと合意済み（docs/TODO.mdで既知のギャップとして管理）。',
    'req-7':
      '直接の競合・参考サービスは特に無し。社内の開発プロセス標準化ツールとして独自に設計している。',
    'req-8':
      '社内企画書がベース。要件定義・基本設計・詳細設計はdocs/README.md（設計ドキュメント）としてすでに文書化済みで、本アプリのCLAUDE.mdからも常に参照される正本として運用している。',
  },
  design: {
    'design-1':
      'Next.js（App Router）でフロントエンド・バックエンドを一本化。UIはshadcn/ui＋Tailwind CSS、アイコンはlucide-react、状態管理はjotai、フォーム検証はzod。DBはPostgreSQL（Cloud SQL）＋Prisma、認証はIdentity Platform（Firebase Auth）、AIはAnthropic Claude API、デプロイはCloud Run、インフラ管理はTerraform。',
    'design-2':
      'Organization（組織）／User（ユーザー）／Template・TemplateVersion（テンプレートとその版）／QuestionTemplate・PromptTemplate・QualityGateItem（版ごとの工程別コンテンツ）／Project（案件）／ProjectStage（案件×工程）／Deliverable（成果物、版管理）。',
    'design-3':
      '①ログイン②案件一覧③案件詳細（工程別ワークスペース）④マイテンプレート一覧⑤テンプレート詳細⑥ユーザー管理⑦公開テンプレート一覧⑧公開テンプレート詳細⑨会社管理、の9画面。',
    'design-4':
      'Identity Platform（認証・セッションCookie発行）、Anthropic Claude API（アプリ内AI実行時の成果物生成）。',
    'design-5':
      '社内複数人（数十人未満）規模の同時利用を想定。v1は単一組織運用だが、organization_idによるスコープ分離を最初から全テーブルに持たせ、将来の複数組織（他社ライセンス提供）展開に備える。',
    'design-6':
      'ロール（user／admin／system_admin）に応じたAPIアクセス制御（管理者用APIはrequireAdmin()で403制御）、組織IDスコープでの他組織データ遮断、セッションCookie（httpOnly）によるトークン運用、Anthropic APIキーはサーバー専用環境変数で保持しクライアントに非露出。',
    'design-7':
      'route/service/repositoryの3層構成（責務分離）、feature-based構成（bulletproof-react準拠）、feature間の直接importをESLintのimport/no-restricted-pathsで禁止、zodスキーマはsrc/schemasに利用レイヤー別で統一。詳細はapp/CLAUDE.mdに集約。',
    'design-8':
      'shadcn/uiのプリミティブとTailwindのユーティリティクラスのみを使用し、Tailwind外の独自CSSは書かない。色はglobal.cssのCSS変数からのみ参照しコンポーネント内でのハードコードは禁止。新規デザインが必要な画面はClaude Designでモックアップを作成し、それを正として実装する（今回のADF自体のUI検討で採った進め方をそのまま標準運用にする）。v1ではダークモード非対応。',
    'design-9':
      'PC専用。社内の業務ツールのためレスポンシブ対応・モバイルアプリ相当の対応は現状スコープ外。',
  },
  implementation: {
    'impl-1':
      '案件一覧・案件詳細（工程別ワークスペース）・マイテンプレート一覧・テンプレート詳細・ユーザー管理・公開テンプレート一覧／詳細・会社管理・ログイン画面の全9画面と、対応するAPI Routes一式（route/service/repository）。',
    'impl-2':
      'TypeScript（strict: true）／Next.js 16（App Router）／React 19／Prisma 6／Node.js。',
    'impl-3':
      'docs/README.md（Part B基本設計・Part C詳細設計）、docs/docusaurus配下のAPI仕様書、app/prisma/schema.prisma。',
    'impl-4':
      'app/CLAUDE.mdの「絶対に守ること」（any禁止、色のハードコード禁止、アイコンはlucide-reactのみ、日本語文字列はconstants/messages.tsに集約 等）と、.claude/backend-code-review-checklist.md。',
    'impl-5':
      'repository.tsを経由せずroute.ts／service.tsからPrisma Clientを直接呼ばないこと、フロントエンドは必ずlib/frontend/apiClient経由でAPI Routesを呼ぶこと（Server Component・Client Componentのどちらもservice/repositoryやPrismaを直接呼ばない）、feature間import制限を破らないこと。',
    'impl-6':
      'Identity Platform未連携の間はusers.identity_platform_uidに`pending:<uuid>`を仮置きしてログイン不可の状態で作成する。AI実行API（execute）は2026-08時点でAnthropic API未連携のモック実装で、プロセス内メモリストアのみを参照するため実DB（Prisma）で作成した案件IDでは常に404になる既知の制約がある。organizations.status=suspendedの判定がgetCurrentUser()の認可チェックに未反映という既知のギャップもある（いずれもdocs/TODO.md参照）。',
  },
  review: {
    'review-1':
      '直近のPull Request差分。特にapp/src/app/api配下のroute／service／repository一式を中心に見る。',
    'review-2':
      '可読性・命名の一貫性、route/service/repositoryの責務分離やfeature間import制限などapp/CLAUDE.mdのアーキテクチャ規約への準拠、認可漏れ（getCurrentUserチェック忘れ等）、Prismaエラーハンドリングの一貫性。',
    'review-3': 'app/CLAUDE.md、.claude/backend-code-review-checklist.md。',
    'review-4': 'TypeScript 5／Next.js 16／React 19。',
  },
}

// 完了済み3工程（requirements/design/implementation）の成果物（プロンプトのみ出力モードで作成 → 貼り付け保存した想定。generationMethodはmanual）
const DELIVERABLE_CONTENT = {
  requirements: `# 要件定義（AI Development Framework Webアプリ）

## 背景・目的
企画書で提案した「AI Development Framework（ADF）」を、PoCではなく実際に使えるWebアプリとして実装する。ゴールはADFという会社の資産そのものを動かす基盤を作ることであり、将来的には他社ライセンス提供も視野に入れる（v1では単一組織利用を優先）。

## 全体コンセプト
案件ごとにADFの7工程（要件定義・設計・実装・レビュー・セキュリティ・テスト・ドキュメント）を順番に進める。各工程では質問形式でヒアリングを行い、回答をもとにAI向けプロンプトを組み立てる。生成された成果物はアプリ内に保存し、品質ゲート（チェックリスト）を通過しないと次工程に進めない。

## 利用者ロール
- 利用者（エンジニア）：案件作成・工程進行・成果物編集
- 管理者：テンプレート（質問セット・プロンプトテンプレート・品質ゲート項目）の編集・バージョン管理、公開／非公開切り替え
- システム管理者：管理者権限に加え、会社（組織）の作成・編集・無効化

## 必須機能（MVP）
F1 案件管理／F2 工程別ガイド付き質問フォーム／F3 プロンプト自動生成／F4 実行モード切り替え／F5 成果物の保存・編集／F6 品質ゲート制御／F7 マイテンプレート／F8 認証／F9 ユーザー管理

## Nice to have
F10 テンプレート公開／F11 公開テンプレートの複製／F12 会社管理

## 非機能要件
- Anthropic APIキーはサーバー側のみで保持
- セッションはhttpOnly Cookieで管理
- organization_id単位でのデータスコープ分離

## 制約
外部顧客向け納期なし。v1は実装速度優先で、自動テスト整備・AI/認証の本連携は後回しにしてよい（docs/TODO.mdで管理）。`,
  design: `# 基本設計（AI Development Framework Webアプリ）

## 技術スタック
| 領域 | 選定 |
| --- | --- |
| フロントエンド／バックエンド | Next.js（App Router、一本化） |
| UI | shadcn/ui + Tailwind CSS |
| アイコン | lucide-react |
| 状態管理 | jotai |
| フォーム検証 | zod |
| DB | PostgreSQL（Cloud SQL）＋ Prisma |
| 認証 | Identity Platform（Firebase Auth） |
| AI API | Anthropic Claude API |
| デプロイ | Cloud Run |
| インフラ管理 | Terraform |

## 主要データエンティティ
Organization / User / Template / TemplateVersion / QuestionTemplate / PromptTemplate / QualityGateItem / Project / ProjectStage / Deliverable

## 画面一覧
ログイン／案件一覧／案件詳細（工程別ワークスペース）／マイテンプレート一覧／テンプレート詳細／ユーザー管理／公開テンプレート一覧／公開テンプレート詳細／会社管理

## セキュリティ・権限設計
- ロール（user／admin／system_admin）に応じたAPIアクセス制御
- 組織IDスコープでの他組織データ遮断
- セッションCookie（httpOnly）によるトークン運用

## 設計規約
route/service/repositoryの3層構成、feature-based構成、feature間直接import禁止（ESLint強制）、zodスキーマはsrc/schemasに統一。詳細はapp/CLAUDE.md参照。

## UI／デザイン方針
shadcn/ui＋Tailwindのユーティリティクラスのみを使用。色はglobal.cssのCSS変数からのみ参照。新規デザインが必要な画面はClaude Designでモックアップを作成し、それを正として実装する。PC専用（レスポンシブ・モバイル対応は現状スコープ外）。`,
  implementation: `# 実装（AI Development Framework Webアプリ）

## 実装範囲
案件一覧・案件詳細（工程別ワークスペース）・マイテンプレート一覧・テンプレート詳細・ユーザー管理・公開テンプレート一覧／詳細・会社管理・ログイン画面の全9画面と、対応するAPI Routes一式（route/service/repository）。

## 使用技術
TypeScript（strict）／Next.js 16（App Router）／React 19／Prisma 6

## アーキテクチャ規約
- \`route.ts\`：認証・認可・バリデーション・レスポンス整形のみ
- \`service.ts\`：ビジネスロジック
- \`repository.ts\`：Prismaを使ったDBアクセスのみ（Prisma Clientはここからのみimport）
- フロントエンドは必ず\`src/lib/frontend/apiClient\`経由でAPI Routesを呼ぶ（Server Component・Client Componentのどちらもservice/repository・Prismaを直接呼ばない）

## 既知の未実装・ギャップ（docs/TODO.md管理）
- Identity Platform本連携未実装（\`identity_platform_uid\`に\`pending:<uuid>\`を仮置き）
- AI実行API（execute）がAnthropic API未連携のモック実装（プロセス内メモリストア参照のため実DBの案件IDでは404になる）
- \`organizations.status = suspended\`の判定が認可チェックに未反映`,
}

// 工程キー → 完了日（実際のgit履歴に合わせたおおよその日付）
const COMPLETED_AT = {
  requirements: new Date('2026-07-24T00:00:00Z'),
  design: new Date('2026-08-01T00:00:00Z'),
  implementation: new Date('2026-08-13T00:00:00Z'),
}

const COMPLETED_STAGE_KEYS = ['requirements', 'design', 'implementation']
const CURRENT_STAGE_KEY = 'review' // 品質ゲート未通過のため、現在はレビュー工程が進行中

// ADF自身のWebアプリ開発を「案件」として登録する（templates.mjsで作成した「ADF標準テンプレート」を参照）。
// 実際の進行に合わせ、要件定義・設計・実装の3工程は完了済み、レビュー工程は回答・プロンプト生成済みで品質ゲート待ち、
// セキュリティ・テスト・ドキュメントは未着手として記録する
export async function seedProjects(
  prisma,
  { seedCompany, systemAdmin, adfTemplate }
) {
  const project = await prisma.project.upsert({
    where: { id: PROJECT_ID },
    update: {},
    create: {
      id: PROJECT_ID,
      organizationId: seedCompany.id,
      name: PROJECT_NAME,
      templateId: adfTemplate.id,
      currentStage: CURRENT_STAGE_KEY,
      overallStatus: 'in_progress',
      createdBy: systemAdmin.id,
    },
  })

  for (const stage of STAGES) {
    const suffix = STAGE_ROW_SUFFIX[stage.key]
    const projectStageId = `00000000-0000-0000-0000-00000000021${suffix}`
    const answers = ANSWERS[stage.key] ?? {}
    const isCompleted = COMPLETED_STAGE_KEYS.includes(stage.key)
    const isCurrent = stage.key === CURRENT_STAGE_KEY
    const hasAnswers = Object.keys(answers).length > 0

    const status = isCompleted
      ? 'completed'
      : isCurrent
        ? 'in_progress'
        : 'not_started'
    const generatedPrompt = hasAnswers
      ? buildGeneratedPrompt(stage, answers)
      : null
    const qualityGateResult = isCompleted
      ? Object.fromEntries(
          stage.qualityGateItems.map((item) => [item.id, { checked: true }])
        )
      : {}

    await prisma.projectStage.upsert({
      where: { id: projectStageId },
      update: {},
      create: {
        id: projectStageId,
        projectId: project.id,
        stageKey: stage.key,
        status,
        answers,
        generatedPrompt,
        qualityGateResult,
        completedAt: COMPLETED_AT[stage.key] ?? null,
      },
    })

    if (isCompleted) {
      await prisma.deliverable.upsert({
        where: { id: `00000000-0000-0000-0000-00000000022${suffix}` },
        update: {},
        create: {
          id: `00000000-0000-0000-0000-00000000022${suffix}`,
          projectStageId,
          content: DELIVERABLE_CONTENT[stage.key],
          generationMethod: 'manual',
          version: 1,
          updatedBy: systemAdmin.id,
        },
      })
    }
  }

  return { adfProject: project }
}
