# TODO

コードベース内に散らばる`TODO`コメントと、実装状況ドキュメント（`docs/docusaurus`）にのみ記載されている既知のギャップを一箇所にまとめたもの。着手する際は該当ファイルを直接検索して最新のコメントを確認すること（このファイルは要約であり、正はコード側のコメント）。

## インフラ（Terraform等）待ち

- なし（2026-08時点で洗い出し済みの項目は下記「認証」「AI」のいずれかに分類される）

## 認証（Identity Platform）連携待ち

Identity Platform側で実際にユーザーを作成し、招待メール（パスワード設定リンク付き）を送信する処理が未実装。作成される`users`レコードの`identityPlatformUid`には`pending:<uuid>`というプレースホルダ値が入り、招待・作成された時点ではまだ実際にログインできない。

- `app/src/app/api/admin/users/service.ts`（`inviteUser`）
- `app/src/app/api/system/companies/service.ts`（`registerCompany`）

## AI（Anthropic API）連携待ち

AI実行API（`POST /api/projects/:id/stages/:stageKey/execute`）がAnthropic APIを呼ばず、保存済みの回答内容から成果物を組み立てるモックのまま。認証チェック・組織スコープも未実装で、実DB（Prisma）で作成した案件IDを渡すと常に`404`になる（`src/lib/services/projects.ts`のプロセス内メモリストア〔シードデータ`p1`〜`p4`〕を参照しているため）。

- `app/src/app/api/projects/[id]/stages/[stageKey]/execute/route.ts`
- `app/src/lib/services/projects.ts`（`executeStage`とファイル冒頭のコメント）
- `app/src/lib/services/templates.ts`（`executeStage`が参照するテンプレート内容のモック。`executeStage`のPrisma移行が終われば本ファイルごと削除できる）

## ドキュメントには記載済みだがコード上に`TODO`が無いもの

- **所属組織のsuspended判定が未実装**：`getCurrentUser()`（`app/src/lib/api/auth/getCurrentUser.ts`）は`users.status`のみ判定し、`organizations.status`が`suspended`かどうかを見ていない。全APIの認可・ログインに影響する（詳細：`docs/docusaurus/docs/api/auth/login-session.md`、`docs/docusaurus/docs/api/index.md`）
- **公開テンプレートの組織横断複製が未対応**：`templates.source_published_template_id`の設計注記にある「将来組織をまたいだ複製にも対応」が2026-08時点では未対応。現状は同一組織内でのみ複製・参照が機能する（詳細：`docs/docusaurus/docs/api/published-templates/index.md`）

## どこにも記載がなかった既知のギャップ

- **`organizations.name`ユニーク制約マイグレーションにバックフィルが無い**：`app/prisma/migrations/20260813151847_organization_name_unique`で`organizations.name`に一意制約を追加したが、適用前に同名の会社（組織）が複数存在していた場合の重複解消（バックフィル）ステップを含んでいない。2026-08時点では非dev環境が存在せず、既に適用済みのマイグレーションファイルを書き換えるのは非推奨のため意図的に後回しにしている。本番相当の環境を用意する際は、マイグレーション適用前に`organizations.name`の重複有無を確認し、必要なら手動で解消すること
