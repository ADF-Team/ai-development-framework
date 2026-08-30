// ADFの7工程マスタ定義（質問セット・品質ゲート項目）。docs/README.md A7（各工程の質問セット）・A8（各工程の品質ゲート）を正本として転記する。
// テンプレート（templates.mjs）と案件（projects.mjs）の両方から参照し、質問ID・文言のズレが起きないようにする。
export const STAGES = [
  {
    key: 'requirements',
    label: '要件定義',
    order: 1,
    questions: [
      {
        id: 'req-1',
        order: 1,
        text: 'この案件の目的・解決したい課題は何ですか？',
      },
      { id: 'req-2', order: 2, text: '想定ユーザー（利用者）は誰ですか？' },
      {
        id: 'req-3',
        order: 3,
        text: '必須機能（MVP）は何ですか？箇条書きで教えてください',
      },
      {
        id: 'req-4',
        order: 4,
        text: 'あれば嬉しい機能（Nice to have）はありますか？',
      },
      {
        id: 'req-5',
        order: 5,
        text: '非機能要件（性能・セキュリティ・可用性等）で気にすべき点はありますか？',
      },
      { id: 'req-6', order: 6, text: '納期・予算の制約はありますか？' },
      {
        id: 'req-7',
        order: 7,
        text: '参考にしたい既存サービス・競合はありますか？',
      },
      {
        id: 'req-8',
        order: 8,
        text: '顧客から受け取っている資料や議事録の要点があれば教えてください',
      },
    ],
    qualityGateItems: [
      { id: 'req-gate-1', order: 1, label: '必須機能（MVP）が明記されている' },
      { id: 'req-gate-2', order: 2, label: '想定ユーザーが明確になっている' },
      {
        id: 'req-gate-3',
        order: 3,
        label: '非機能要件（性能・セキュリティ等）に抜け漏れがない',
      },
      { id: 'req-gate-4', order: 4, label: '要件間の矛盾がない' },
      {
        id: 'req-gate-5',
        order: 5,
        label: '顧客・関係者の合意が取れている（社内案件の場合は担当者承認）',
      },
    ],
  },
  {
    key: 'design',
    label: '設計',
    order: 2,
    questions: [
      {
        id: 'design-1',
        order: 1,
        text: '使用する技術スタック（言語・フレームワーク）は決まっていますか？',
      },
      {
        id: 'design-2',
        order: 2,
        text: '主要なデータエンティティ（登場する「モノ」）は何ですか？',
      },
      {
        id: 'design-3',
        order: 3,
        text: '想定される画面・機能一覧は？（要件定義書から引用可）',
      },
      {
        id: 'design-4',
        order: 4,
        text: '外部連携するシステム・APIはありますか？',
      },
      {
        id: 'design-5',
        order: 5,
        text: '想定同時接続数・データ量などのスケール感は？',
      },
      {
        id: 'design-6',
        order: 6,
        text: '特にセキュリティ・権限管理で気をつけたい点は？',
      },
      {
        id: 'design-7',
        order: 7,
        text: '既存の設計規約・命名規則があれば教えてください',
      },
      {
        id: 'design-8',
        order: 8,
        text: 'UI／デザインの方向性はありますか？（既存のブランドガイドライン、参考にしたいデザインテイスト、ダーク/ライトモードの要否、既存デザインシステム・UIライブラリの指定など）',
      },
      {
        id: 'design-9',
        order: 9,
        text: 'デバイス対応の範囲は？（PC専用／レスポンシブ対応／モバイルアプリ相当の対応が必要か）',
      },
    ],
    qualityGateItems: [
      {
        id: 'design-gate-1',
        order: 1,
        label: '要件定義書の機能がすべて設計に反映されている',
      },
      { id: 'design-gate-2', order: 2, label: 'DB設計に矛盾・重複がない' },
      {
        id: 'design-gate-3',
        order: 3,
        label: 'API設計が命名規則・構成標準に沿っている',
      },
      {
        id: 'design-gate-4',
        order: 4,
        label: 'セキュリティ・権限周りの設計に漏れがない',
      },
      {
        id: 'design-gate-5',
        order: 5,
        label: '拡張性・パフォーマンス面のリスクが検討されている',
      },
      {
        id: 'design-gate-6',
        order: 6,
        label:
          'UI／デザインの方向性が定義されている（既存デザインとの整合性、または「新規プロダクトのため新たにデザイン方針を決定した」旨が明記されている）',
      },
    ],
  },
  {
    key: 'implementation',
    label: '実装',
    order: 3,
    questions: [
      {
        id: 'impl-1',
        order: 1,
        text: '実装するのは全体のうちどの機能・画面ですか？',
      },
      {
        id: 'impl-2',
        order: 2,
        text: '使用する言語・フレームワーク・バージョンは？',
      },
      { id: 'impl-3', order: 3, text: '参照すべき設計書・API仕様は？' },
      {
        id: 'impl-4',
        order: 4,
        text: '自社のコーディング規約・スタイルガイドはありますか？',
      },
      {
        id: 'impl-5',
        order: 5,
        text: '既存コードとの整合性で気をつけるべき点は？',
      },
      {
        id: 'impl-6',
        order: 6,
        text: '特に注意すべきエッジケース・例外処理はありますか？',
      },
    ],
    qualityGateItems: [
      {
        id: 'impl-gate-1',
        order: 1,
        label:
          '設計書通りに実装されている（差分がない、または差分理由が説明されている）',
      },
      {
        id: 'impl-gate-2',
        order: 2,
        label: 'コーディング規約に違反していない',
      },
      {
        id: 'impl-gate-3',
        order: 3,
        label: '主要な異常系・エッジケースが考慮されている',
      },
      { id: 'impl-gate-4', order: 4, label: 'ビルド・Lintが通る' },
    ],
  },
  {
    key: 'review',
    label: 'レビュー',
    order: 4,
    questions: [
      {
        id: 'review-1',
        order: 1,
        text: 'レビュー対象のコード（ファイル・差分）は？',
      },
      {
        id: 'review-2',
        order: 2,
        text: '重点的に見てほしい観点は？（可読性／パフォーマンス／セキュリティ等）',
      },
      { id: 'review-3', order: 3, text: '遵守すべきコーディング規約は？' },
      {
        id: 'review-4',
        order: 4,
        text: '対象の言語・フレームワークのバージョンは？',
      },
    ],
    qualityGateItems: [
      {
        id: 'review-gate-1',
        order: 1,
        label:
          '可読性・命名に関する指摘がすべて解消（または対応方針が決定）されている',
      },
      {
        id: 'review-gate-2',
        order: 2,
        label: 'リファクタリング提案が確認済み',
      },
      {
        id: 'review-gate-3',
        order: 3,
        label: 'レビュー指摘のうち重大なものがゼロ',
      },
    ],
  },
  {
    key: 'security',
    label: 'セキュリティ',
    order: 5,
    questions: [
      {
        id: 'security-1',
        order: 1,
        text: '対象システムの用途・扱うデータの機微性は？（個人情報の有無等）',
      },
      {
        id: 'security-2',
        order: 2,
        text: '対象コード・エンドポイント一覧は？',
      },
      {
        id: 'security-3',
        order: 3,
        text: '使用しているライブラリ・依存関係の一覧は？',
      },
      {
        id: 'security-4',
        order: 4,
        text: '外部公開の有無、想定される攻撃経路は？',
      },
    ],
    qualityGateItems: [
      {
        id: 'security-gate-1',
        order: 1,
        label: 'OWASP Top 10観点での重大な脆弱性がゼロ',
      },
      {
        id: 'security-gate-2',
        order: 2,
        label: '依存ライブラリに既知の重大脆弱性がない',
      },
      {
        id: 'security-gate-3',
        order: 3,
        label: '検出された指摘が重要度別に整理され、対応方針が決まっている',
      },
    ],
  },
  {
    key: 'test',
    label: 'テスト',
    order: 6,
    questions: [
      { id: 'test-1', order: 1, text: 'テスト対象の機能・仕様書は？' },
      {
        id: 'test-2',
        order: 2,
        text: '単体テスト／結合テストどちらを重視しますか？',
      },
      { id: 'test-3', order: 3, text: '使用するテストフレームワークは？' },
      { id: 'test-4', order: 4, text: '特に網羅したい異常系・境界値は？' },
    ],
    qualityGateItems: [
      {
        id: 'test-gate-1',
        order: 1,
        label: '主要機能に対する単体テストが存在する',
      },
      {
        id: 'test-gate-2',
        order: 2,
        label: '結合テストで想定シナリオがカバーされている',
      },
      { id: 'test-gate-3', order: 3, label: 'テストがすべてパスしている' },
      {
        id: 'test-gate-4',
        order: 4,
        label: 'カバレッジが一定水準（目安値は運用しながら調整）',
      },
    ],
  },
  {
    key: 'documentation',
    label: 'ドキュメント',
    order: 7,
    questions: [
      {
        id: 'doc-1',
        order: 1,
        text: 'ドキュメントの対象読者は？（社内エンジニア／顧客／両方）',
      },
      {
        id: 'doc-2',
        order: 2,
        text: '生成したいドキュメント種別は？（README／API仕様書／DB設計書等）',
      },
      { id: 'doc-3', order: 3, text: '参照すべきソースコード・設計書は？' },
      {
        id: 'doc-4',
        order: 4,
        text: '既存のドキュメントフォーマット・テンプレートはありますか？',
      },
    ],
    qualityGateItems: [
      {
        id: 'doc-gate-1',
        order: 1,
        label: 'README・API仕様書・DB設計書が最新のコード・設計と一致している',
      },
      {
        id: 'doc-gate-2',
        order: 2,
        label: '対象読者（社内／顧客）に応じた記述レベルになっている',
      },
      { id: 'doc-gate-3', order: 3, label: '誤字脱字・欠落セクションがない' },
    ],
  },
]

// プロンプトテンプレート（雛形）を組み立てる。POST /generate-prompt の固定フォーマット（docs/docusaurus/docs/api/stages/generate-prompt.md）に合わせ、
// 回答部分だけ {{answer:質問ID}} のプレースホルダーにする
export function buildPromptTemplate(stage) {
  const lines = [
    `あなたは${stage.label}を担当する専門家です。以下のヒアリング回答をもとに、${stage.label}工程の成果物を作成してください。`,
    '',
  ]
  for (const question of stage.questions) {
    lines.push(`${question.order}. ${question.text}`)
    lines.push(`→ {{answer:${question.id}}}`)
    lines.push('')
  }
  lines.push(
    '上記を踏まえ、実務で使えるレベルの成果物をMarkdown形式で出力してください。'
  )
  return lines.join('\n')
}

// 実際の回答を埋め込んだ生成プロンプトを組み立てる（POST /generate-prompt と同じロジック。未回答の質問はスキップする）
export function buildGeneratedPrompt(stage, answers) {
  const lines = [
    `あなたは${stage.label}を担当する専門家です。以下のヒアリング回答をもとに、${stage.label}工程の成果物を作成してください。`,
    '',
  ]
  for (const question of stage.questions) {
    const answer = answers[question.id]
    if (!answer) continue
    lines.push(`${question.order}. ${question.text}`)
    lines.push(`→ ${answer}`)
    lines.push('')
  }
  lines.push(
    '上記を踏まえ、実務で使えるレベルの成果物をMarkdown形式で出力してください。'
  )
  return lines.join('\n')
}
