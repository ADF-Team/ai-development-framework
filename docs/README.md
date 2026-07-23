# AI Development Framework（ADF）Webアプリ 設計ドキュメント

# Part A. 要件定義（WHAT / WHY）

「何を・誰のために・なぜ作るか」を定義する。実装方法や技術の話はここには含めない。

## A1. 背景・目的

- 企画書で提案した「AI Development Framework（ADF）」を、実際に使えるWebアプリとして実装する。
- ゴールはPoCの一時的な検証ツールではなく、**ADFという会社の資産そのもの**を動かす基盤を作ること。
- 将来的に他社ライセンス提供も視野に入れる（ただしv1では単一組織利用を優先）。

## A2. 全体コンセプト

案件ごとに、ADFの7工程（要件定義・設計・実装・レビュー・セキュリティ・テスト・ドキュメント）を順番に進める。
各工程では、アプリが質問形式でヒアリングを行い、その回答をもとにAI向けのプロンプトを組み立てる。
ユーザーはそのプロンプトを「コピーして外部で使う」か「アプリ内でそのままAIに実行させる」かを選べる。
生成された成果物はアプリ内に保存され、あとから参照・編集できる。
各工程には品質ゲート（チェックリスト）があり、通過しないと次工程に進めない。

```
案件作成
  ↓
[工程1: 要件定義]
  質問フォームに回答
    ↓
  回答からプロンプトを自動生成
    ↓
  実行モード選択：①プロンプトのみ出力（コピーして外部で使用） ②アプリ内でAI実行
    ↓
  成果物をDBに保存（後から参照・編集可）
    ↓
  品質ゲート（チェックリスト）を満たす → 次工程へ
  ↓
[工程2: 設計] → … → [工程7: ドキュメント]
```

### 工程マスタ定義（共通で使う語彙。以降すべてこれを参照する）

| 順序 | 表示名       | stage_key        |
| ---- | ------------ | ---------------- |
| 1    | 要件定義     | `requirements`   |
| 2    | 設計         | `design`         |
| 3    | 実装         | `implementation` |
| 4    | レビュー     | `review`         |
| 5    | セキュリティ | `security`       |
| 6    | テスト       | `test`           |
| 7    | ドキュメント | `documentation`  |

## A3. 利用者ロール

| ロール               | できること                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| 利用者（エンジニア） | 案件を作成・選択し、工程を進める。質問に回答し、プロンプト生成・実行・成果物編集を行う                        |
| 管理者               | 7工程それぞれの「質問セット」「プロンプトテンプレート」「品質ゲートのチェック項目」を編集・バージョン管理する |

※ v1では「利用者」「管理者」は同一人物が兼ねてもよいが、権限は分けておく。

## A4. 画面一覧（存在すべき画面。詳細レイアウトはPart Cで扱う）

1. ログイン画面
2. 案件一覧画面（進行中・完了案件と、7工程の進捗ステータス表示）
3. 案件詳細画面（工程別進行画面：質問フォーム／プロンプト表示／実行モード切替／成果物表示・編集／品質ゲート判定）
4. テンプレート管理画面（管理者用：質問セット・プロンプトテンプレート・品質ゲート項目の編集）
5. ユーザー管理画面（管理者用：メンバー招待・ロール変更・アカウント無効化）

## A5. 機能要件一覧

| #   | 機能                         | 概要                                                                                     |
| --- | ---------------------------- | ---------------------------------------------------------------------------------------- |
| F1  | 案件管理                     | 案件の作成・一覧表示・工程別進捗ステータスの表示                                         |
| F2  | 工程別ガイド付き質問フォーム | 工程ごとに用意された質問に回答する形式のフォーム                                         |
| F3  | プロンプト自動生成           | 質問への回答をテンプレートに埋め込み、その工程用のプロンプトを組み立てる                 |
| F4  | 実行モード切り替え           | 「プロンプトのみ出力（コピー用）」／「アプリ内でAI実行し成果物まで生成」を選択可能にする |
| F5  | 成果物の保存・編集           | 生成された成果物（文章・コード等）をDBに保存し、あとから参照・編集できる                 |
| F6  | 品質ゲート制御               | チェックリスト形式の通過条件を満たさないと次工程に進めないようにする                     |
| F7  | テンプレート管理             | 管理者が7工程分の質問セット・プロンプトテンプレート・品質ゲート項目を編集できる          |
| F8  | 認証                         | 社内複数人がログインして利用できる                                                       |
| F9  | ユーザー管理                 | 管理者がメンバーを招待し、ロール（利用者／管理者）の設定・アカウントの無効化を行える     |

## A6. 業務データ（概念レベル：どんな情報を扱うか。テーブル設計はPart Cで扱う）

- **案件**：案件名、作成日、現在の工程、全体ステータス
- **工程の進行状況**：案件×工程ごとの状態、回答内容、生成プロンプト、成果物、品質ゲート判定結果
- **質問セット**：工程ごとの質問項目一覧
- **プロンプトテンプレート**：工程ごとのプロンプト雛形
- **品質ゲート項目**：工程ごとのチェック項目一覧
- **成果物**：工程に紐づく生成物（本文、生成方式、編集履歴）
- **ユーザー**：利用者／管理者の権限

## A7. 各工程の質問セット（確定）

各工程で、AIに成果物を作らせる前にヒアリングする質問一覧。ここで集めた回答をプロンプトテンプレートに埋め込む。

### 工程1：要件定義

1. この案件の目的・解決したい課題は何ですか？
2. 想定ユーザー（利用者）は誰ですか？
3. 必須機能（MVP）は何ですか？箇条書きで教えてください
4. あれば嬉しい機能（Nice to have）はありますか？
5. 非機能要件（性能・セキュリティ・可用性等）で気にすべき点はありますか？
6. 納期・予算の制約はありますか？
7. 参考にしたい既存サービス・競合はありますか？
8. 顧客から受け取っている資料や議事録の要点があれば教えてください

### 工程2：設計

1. 使用する技術スタック（言語・フレームワーク）は決まっていますか？
2. 主要なデータエンティティ（登場する「モノ」）は何ですか？
3. 想定される画面・機能一覧は？（要件定義書から引用可）
4. 外部連携するシステム・APIはありますか？
5. 想定同時接続数・データ量などのスケール感は？
6. 特にセキュリティ・権限管理で気をつけたい点は？
7. 既存の設計規約・命名規則があれば教えてください
8. UI／デザインの方向性はありますか？（既存のブランドガイドライン、参考にしたいデザインテイスト、ダーク/ライトモードの要否、既存デザインシステム・UIライブラリの指定など）
9. デバイス対応の範囲は？（PC専用／レスポンシブ対応／モバイルアプリ相当の対応が必要か）

> 💡運用メモ：Q8で新規にデザイン方針を決める必要がある場合、ADFのプロンプト出力だけで完結させず、Claude Designアプリ等でモックアップを作成し、その結果を「デザイン方針」として工程2の成果物に含める運用を推奨する（今回のADF自体のUI検討と同じ進め方）。

### 工程3：実装

1. 実装するのは全体のうちどの機能・画面ですか？
2. 使用する言語・フレームワーク・バージョンは？
3. 参照すべき設計書・API仕様は？
4. 自社のコーディング規約・スタイルガイドはありますか？
5. 既存コードとの整合性で気をつけるべき点は？
6. 特に注意すべきエッジケース・例外処理はありますか？

### 工程4：レビュー

1. レビュー対象のコード（ファイル・差分）は？
2. 重点的に見てほしい観点は？（可読性／パフォーマンス／セキュリティ等）
3. 遵守すべきコーディング規約は？
4. 対象の言語・フレームワークのバージョンは？

### 工程5：セキュリティ

1. 対象システムの用途・扱うデータの機微性は？（個人情報の有無等）
2. 対象コード・エンドポイント一覧は？
3. 使用しているライブラリ・依存関係の一覧は？
4. 外部公開の有無、想定される攻撃経路は？

### 工程6：テスト

1. テスト対象の機能・仕様書は？
2. 単体テスト／結合テストどちらを重視しますか？
3. 使用するテストフレームワークは？
4. 特に網羅したい異常系・境界値は？

### 工程7：ドキュメント

1. ドキュメントの対象読者は？（社内エンジニア／顧客／両方）
2. 生成したいドキュメント種別は？（README／API仕様書／DB設計書等）
3. 参照すべきソースコード・設計書は？
4. 既存のドキュメントフォーマット・テンプレートはありますか？

## A8. 各工程の品質ゲート（合格基準・たたき台）

各工程からの成果物が「次工程に進めるレベルか」を判定するチェック項目。すべて満たすと次工程へ進める。

### 工程1：要件定義

- [ ] 必須機能（MVP）が明記されている
- [ ] 想定ユーザーが明確になっている
- [ ] 非機能要件（性能・セキュリティ等）に抜け漏れがない
- [ ] 要件間の矛盾がない
- [ ] 顧客・関係者の合意が取れている（社内案件の場合は担当者承認）

### 工程2：設計

- [ ] 要件定義書の機能がすべて設計に反映されている
- [ ] DB設計に矛盾・重複がない
- [ ] API設計が命名規則・構成標準に沿っている
- [ ] セキュリティ・権限周りの設計に漏れがない
- [ ] 拡張性・パフォーマンス面のリスクが検討されている
- [ ] UI／デザインの方向性が定義されている（既存デザインとの整合性、または「新規プロダクトのため新たにデザイン方針を決定した」旨が明記されている）

### 工程3：実装

- [ ] 設計書通りに実装されている（差分がない、または差分理由が説明されている）
- [ ] コーディング規約に違反していない
- [ ] 主要な異常系・エッジケースが考慮されている
- [ ] ビルド・Lintが通る

### 工程4：レビュー

- [ ] 可読性・命名に関する指摘がすべて解消（または対応方針が決定）されている
- [ ] リファクタリング提案が確認済み
- [ ] レビュー指摘のうち重大なものがゼロ

### 工程5：セキュリティ

- [ ] OWASP Top 10観点での重大な脆弱性がゼロ
- [ ] 依存ライブラリに既知の重大脆弱性がない
- [ ] 検出された指摘が重要度別に整理され、対応方針が決まっている

### 工程6：テスト

- [ ] 主要機能に対する単体テストが存在する
- [ ] 結合テストで想定シナリオがカバーされている
- [ ] テストがすべてパスしている
- [ ] カバレッジが一定水準（目安値は運用しながら調整）

### 工程7：ドキュメント

- [ ] README・API仕様書・DB設計書が最新のコード・設計と一致している
- [ ] 対象読者（社内／顧客）に応じた記述レベルになっている
- [ ] 誤字脱字・欠落セクションがない

※ たたき台のため、実運用しながら基準の粒度・妥当性を見直す前提とする。

---

**Part A（要件定義）は上記A1〜A8をもって、ひとまず完了とする（たたき台段階。運用しながら見直す前提）。**

---

# Part B. 基本設計（HOW／全体構造）

「どう作るか」の全体方針を定義する。クラス・関数レベルの詳細はPart Cで扱う。

## B1. 技術スタック（確定）

| 領域                         | 選定                     | 備考                                                                                                                                                |
| ---------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| フロントエンド／バックエンド | Next.js（一本化）        | API Routesでバックエンドロジックも実装。**将来FastAPIへの切り出しを見据え**、ルートハンドラは薄く保ち、業務ロジックは`lib/services`等に分離しておく |
| インフラ管理                 | Terraform                | GCPリソースをコードで管理                                                                                                                           |
| クラウド                     | Google Cloud             |                                                                                                                                                     |
| デプロイ先                   | Cloud Run（想定）        | Next.jsをコンテナ化してデプロイ。Terraform管理・サーバーレスの構成と自然に整合する                                                                  |
| 認証                         | Identity Platform        | Firebase Authのアップグレード版。料金差が実質ないため最初から採用し、将来の他社ライセンス提供（Phase3）時にマルチテナント機能をそのまま使う         |
| AI API                       | Claude（Anthropic API）  | Next.js API Routesのサーバーサイドから呼び出し、APIキーはクライアントに露出させない                                                                 |
| DB                           | Cloud SQL for PostgreSQL | 案件・工程・テンプレート・品質ゲート等のリレーショナルなデータ構造と相性が良い                                                                      |
| ストレージ                   | Cloud Storage            | 生成物のファイルエクスポート等に使用                                                                                                                |

## B2. 将来の拡張を見据えた設計方針

- Next.jsのAPI Routes内では、ルートハンドラに直接ロジックを書かず、`lib/services`層に業務ロジックを集約しておく（将来FastAPIへ移植する際、ロジック部分の書き直しを最小限にするため）
- フロントエンド側も、Server Component（`page.tsx`）の初期表示データ取得を含めてすべて`lib/api`配下の関数経由でAPI Routesを叩く（`lib/services`を直接呼ばない）。呼び出し口をHTTP境界に統一しておくことで、将来バックエンドをFastAPIへ切り出す際もフロントエンド側のコードを変更せずに済む
- 「組織（Organization）」という概念をデータモデル上に用意しておく（v1では単一組織のみ運用するが、Identity Platformのマルチテナントと対応させやすくするため）

## B3. Identity Platform運用フロー（ドラフト）

- **初期管理者の作成**：管理者が誰もいない状態からは招待できないため、最初の管理者アカウントはアプリのUIを介さず、デプロイ時のシードスクリプト（Terraform適用後に1回だけ実行）またはIdentity Platformコンソールから直接作成する
- **アカウント発行（2人目以降）**：セルフサインアップは無効。管理者画面からメールアドレスとロール（利用者／管理者）を指定して招待する。招待メールには本人がパスワードを設定するためのリンクを含める（管理者がパスワードを決めて渡すことはしない）
- **パスワードリセット**：Identity Platform標準のメールリンク方式を利用（独自実装しない）
- **アカウント無効化**：退職者等は削除ではなく無効化（データの整合性・成果物の紐付けを保持するため）

> ⚠️判断が分かれそうな点：社内数人規模なら「管理者が手動招待」で十分だと思いますが、人数が増える見込みがあるなら別方式（例：会社ドメインメールなら自動許可）も検討可。

## B4. コスト管理（ドラフト）

- v1では組織単位でAnthropic APIキーを1つ保持（環境変数で管理、クライアントには露出させない）
- 工程ごとのAPI呼び出しでトークン使用量を記録し、案件詳細画面に「この案件でどれくらいAPIを使ったか」を表示する
- 予算アラート機能はv1では実装せず、Part C以降または運用しながら判断する

> ⚠️判断が分かれそうな点：将来他社ライセンス時は組織ごとにAPIキー／使用量を分離する必要があるため、記録は最初から「組織ID」に紐づけておく。

## B5. 画面遷移（ドラフト）

```
ログイン
  ↓
案件一覧
  ├─ 新規案件作成 → 案件詳細（工程1から開始）
  └─ 既存案件を選択 → 案件詳細（現在の工程から再開）

案件詳細（工程タブ：要件定義〜ドキュメント）
  質問フォーム回答 → プロンプト生成 → 実行モード選択
    ├─ プロンプトのみ出力（コピー用モーダル）
    └─ アプリ内実行 → 成果物表示・編集
  → 品質ゲートチェック → 通過 → 次工程タブへ

（別動線）管理者メニュー → テンプレート管理画面
  → 工程を選択 → 質問セット／プロンプトテンプレート／品質ゲート項目を編集
```

## B6. API設計（ドラフト・主要エンドポイント）

| メソッド | パス                                                 | 概要                                                                       |
| -------- | ---------------------------------------------------- | -------------------------------------------------------------------------- |
| GET      | `/api/projects`                                      | 案件一覧取得                                                               |
| POST     | `/api/projects`                                      | 案件作成                                                                   |
| GET      | `/api/projects/:id`                                  | 案件詳細（工程別ステータス含む）取得                                       |
| GET      | `/api/projects/:id/stages/:stageKey`                 | 特定工程の質問・回答・プロンプト・成果物・品質ゲート状況を取得             |
| POST     | `/api/projects/:id/stages/:stageKey/answers`         | 質問への回答を保存                                                         |
| POST     | `/api/projects/:id/stages/:stageKey/generate-prompt` | 回答をテンプレートに埋め込みプロンプトを生成                               |
| POST     | `/api/projects/:id/stages/:stageKey/execute`         | Claude APIを呼び出し、成果物を生成・保存                                   |
| PATCH    | `/api/projects/:id/stages/:stageKey/deliverable`     | 成果物を編集・保存                                                         |
| POST     | `/api/projects/:id/stages/:stageKey/quality-gate`    | 品質ゲートのチェック結果を送信し、通過判定・次工程への移行を行う           |
| GET/PUT  | `/api/admin/templates/:stageKey`                     | （管理者用）質問セット・プロンプトテンプレート・品質ゲート項目の取得／編集 |
| GET      | `/api/admin/users`                                   | （管理者用）組織内メンバー一覧取得                                         |
| POST     | `/api/admin/users`                                   | （管理者用）メンバーを招待（メールアドレス・ロールを指定）                 |
| PATCH    | `/api/admin/users/:id`                               | （管理者用）ロール変更・アカウント無効化／再有効化                         |

※ 認証はIdentity PlatformのSDKがクライアント側で発行するIDトークンをAPI Routes側で検証する方式（専用のログインAPIは持たない）

## B7. DBテーブル設計（ドラフト）

| テーブル             | 主なカラム                                                                                                                                                                  | 備考                                        |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `organizations`      | id, name, created_at                                                                                                                                                        | v1では1組織のみだが最初から用意             |
| `users`              | id, organization_id, email, role（user/admin）, display_name, created_at                                                                                                    |                                             |
| `projects`           | id, organization_id, name, current_stage, overall_status, created_by, created_at                                                                                            |                                             |
| `project_stages`     | id, project_id, stage_key（7工程のenum）, status（未着手/進行中/品質ゲート待ち/完了）, answers（json）, generated_prompt（text）, quality_gate_result（json）, completed_at | 案件×工程の1レコード                        |
| `deliverables`       | id, project_stage_id, content（text）, generation_method（manual/ai_executed）, version, updated_by, updated_at                                                             | 編集履歴はversionで管理。値の詳細はC2.0参照 |
| `question_templates` | id, organization_id, stage_key, questions（json配列）, version, updated_at                                                                                                  | 管理者編集用                                |
| `prompt_templates`   | id, organization_id, stage_key, template_text, version, updated_at                                                                                                          | 管理者編集用                                |
| `quality_gate_items` | id, organization_id, stage_key, items（json配列）, version, updated_at                                                                                                      | 管理者編集用                                |
| `api_usage_logs`     | id, project_stage_id, organization_id, tokens_used, cost_estimate, called_at                                                                                                | コスト可視化用                              |

---

**Part B（基本設計）は上記B1〜B7をもって、ひとまず完了とする（たたき台段階。実装しながら見直す前提）。**

---

# Part C. 詳細設計（内部の作り）

**状態：ドラフト完了（実装しながら見直す前提）**

## C1. テーブル定義（詳細）

版管理が必要なテーブル（`deliverables`／`question_templates`／`prompt_templates`／`quality_gate_items`）は、更新のたびに新しい行を追加する**追記型（Append-only）**とし、`version`の最大値が「現在有効な版」となる設計にする。

### organizations

| カラム     | 型           | 制約                          |
| ---------- | ------------ | ----------------------------- |
| id         | UUID         | PK, default gen_random_uuid() |
| name       | VARCHAR(255) | NOT NULL                      |
| created_at | TIMESTAMPTZ  | NOT NULL, default now()       |

### users

| カラム                | 型                        | 制約                          |
| --------------------- | ------------------------- | ----------------------------- |
| id                    | UUID                      | PK                            |
| organization_id       | UUID                      | NOT NULL, FK→organizations.id |
| identity_platform_uid | VARCHAR(128)              | NOT NULL, UNIQUE              |
| email                 | VARCHAR(255)              | NOT NULL, UNIQUE              |
| role                  | ENUM('user','admin')      | NOT NULL, default 'user'      |
| display_name          | VARCHAR(100)              |                               |
| status                | ENUM('active','disabled') | NOT NULL, default 'active'    |
| created_at            | TIMESTAMPTZ               | NOT NULL, default now()       |

INDEX: `organization_id`

### projects

| カラム                  | 型                              | 制約                             |
| ----------------------- | ------------------------------- | -------------------------------- |
| id                      | UUID                            | PK                               |
| organization_id         | UUID                            | NOT NULL, FK                     |
| name                    | VARCHAR(255)                    | NOT NULL                         |
| current_stage           | ENUM(7工程キー)                 | NOT NULL, default 'requirements' |
| overall_status          | ENUM('in_progress','completed') | NOT NULL, default 'in_progress'  |
| created_by              | UUID                            | FK→users.id                      |
| created_at / updated_at | TIMESTAMPTZ                     | NOT NULL                         |

INDEX: `organization_id`, `overall_status`

### project_stages（案件×工程で1レコード）

| カラム              | 型                                                                                        | 制約                                                                                                                         |
| ------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| id                  | UUID                                                                                      | PK                                                                                                                           |
| project_id          | UUID                                                                                      | NOT NULL, FK                                                                                                                 |
| stage_key           | ENUM('requirements','design','implementation','review','security','test','documentation') | NOT NULL                                                                                                                     |
| status              | ENUM('not_started','in_progress','quality_gate_pending','completed')                      | NOT NULL, default 'not_started'                                                                                              |
| answers             | JSONB                                                                                     | 質問ID→回答のマップ（例：`{"q1": "回答内容"}`。キーは対応する`question_templates.questions[].id`と一致させる）               |
| generated_prompt    | TEXT                                                                                      | 最新の生成結果のみ保持（`deliverables`と異なり版管理はしない。回答修正のたびに再生成・上書きされる）                         |
| quality_gate_result | JSONB                                                                                     | チェック項目ID→チェック有無・チェック者・日時（例：`{"item1": {"checked": true, "checkedBy": "uuid", "checkedAt": "..."}}`） |
| completed_at        | TIMESTAMPTZ                                                                               | NULL可                                                                                                                       |

UNIQUE: `(project_id, stage_key)` ／ INDEX: `project_id`

### deliverables（追記型）

| カラム            | 型                           | 制約         |
| ----------------- | ---------------------------- | ------------ |
| id                | UUID                         | PK           |
| project_stage_id  | UUID                         | NOT NULL, FK |
| content           | TEXT                         |              |
| generation_method | ENUM('manual','ai_executed') | NOT NULL     |
| version           | INTEGER                      | NOT NULL     |
| updated_by        | UUID                         | FK→users.id  |
| created_at        | TIMESTAMPTZ                  | NOT NULL     |

INDEX: `(project_stage_id, version)`

### question_templates / prompt_templates / quality_gate_items（いずれも追記型・管理者編集用）

| カラム                            | 型              | 制約                                                                                                                                  |
| --------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| id                                | UUID            | PK                                                                                                                                    |
| organization_id                   | UUID            | NOT NULL, FK                                                                                                                          |
| stage_key                         | ENUM(7工程キー) | NOT NULL                                                                                                                              |
| questions / template_text / items | JSONB or TEXT   | 内容本体。`questions`の各要素は`{id, text, order}`（例：`{"id":"q1","text":"...","order":1}`）。`items`の各要素は`{id, label, order}` |
| version                           | INTEGER         | NOT NULL                                                                                                                              |
| created_by                        | UUID            | FK→users.id                                                                                                                           |
| created_at                        | TIMESTAMPTZ     | NOT NULL                                                                                                                              |

UNIQUE: `(organization_id, stage_key, version)`

### api_usage_logs

| カラム                       | 型            | 制約                                     |
| ---------------------------- | ------------- | ---------------------------------------- |
| id                           | UUID          | PK                                       |
| organization_id              | UUID          | NOT NULL, FK                             |
| project_stage_id             | UUID          | NULL可（工程に紐づかない呼び出しも想定） |
| input_tokens / output_tokens | INTEGER       |                                          |
| estimated_cost_usd           | NUMERIC(10,4) |                                          |
| called_at                    | TIMESTAMPTZ   | NOT NULL                                 |

INDEX: `(organization_id, called_at)`

---

## C2. APIエンドポイント詳細仕様

認証：全エンドポイント共通で、Identity PlatformのIDトークンを`Authorization: Bearer <token>`で受け取り、サーバー側で検証する。エラー時は`401 Unauthorized`。

### C2.0 状態値（status／mode系）の定義

以下の値は、DB・API・フロントで共通して使う語彙として固定する。

| 項目                                                              | 型   | 値                     | 意味                                                     |
| ----------------------------------------------------------------- | ---- | ---------------------- | -------------------------------------------------------- |
| `project_stages.status`                                           | ENUM | `not_started`          | 質問未回答の状態                                         |
|                                                                   |      | `in_progress`          | 質問回答中〜成果物未生成                                 |
|                                                                   |      | `quality_gate_pending` | 成果物は生成済みだが、品質ゲート未通過                   |
|                                                                   |      | `completed`            | 品質ゲート通過済み。次工程へ進行可能                     |
| `projects.overall_status`                                         | ENUM | `in_progress`          | いずれかの工程が`completed`未満                          |
|                                                                   |      | `completed`            | 工程7（ドキュメント）まで`completed`                     |
| `execution_mode`（UI選択・API `execute`呼び出しの前提）           | ENUM | `prompt_only`          | プロンプトのみ出力し、外部で生成した結果を後で貼り付ける |
|                                                                   |      | `ai_executed`          | アプリ内でClaude APIを呼び出し、そのまま成果物を生成する |
| `deliverables.generation_method`（保存された成果物1件ごとの記録） | ENUM | `manual`               | `prompt_only`で進めた場合の貼り付け・手動編集による保存  |
|                                                                   |      | `ai_executed`          | `/execute`エンドポイント経由でAI生成された保存           |
| `users.role`                                                      | ENUM | `user`                 | 案件を進める一般利用者                                   |
|                                                                   |      | `admin`                | テンプレート管理も可能な管理者                           |
| `users.status`                                                    | ENUM | `active`               | ログイン可能                                             |
|                                                                   |      | `disabled`             | 無効化済み（退職者等）                                   |

**状態遷移ルール（project_stages.status）**

```
not_started --(質問に1つ以上回答)--> in_progress
in_progress --(成果物が1件以上保存される)--> quality_gate_pending
quality_gate_pending --(品質ゲート全項目チェック)--> completed
```

※ `quality_gate_pending`の間は、回答の修正・成果物の再生成・再編集がいつでも可能（品質ゲートを再度満たせば`completed`に進める）。

**`execution_mode`の扱いについての補足**
`execution_mode`はAPIリクエストのパラメータとしては送信しない。UI上でユーザーが選んだ結果に応じて、後続で呼び出すエンドポイントが変わるだけである（`ai_executed`を選んだ場合は`/execute`を呼ぶ、`prompt_only`を選んだ場合はユーザーが外部で生成した内容を`/deliverable`（PATCH）で送る）。つまり`execution_mode`はフロントエンドの状態管理上の概念であり、サーバー側は関知しない。

### GET /api/projects

案件一覧を、各案件の7工程分のステータスサマリー付きで返す（一覧画面の進捗バー表示に必要なため、工程別詳細は含めずステータスのみ返す）。
**Response 200**

```json
{
  "projects": [
    {
      "id": "uuid",
      "name": "案件A",
      "overallStatus": "in_progress",
      "currentStage": "design",
      "stageStatuses": {
        "requirements": "completed",
        "design": "in_progress",
        "implementation": "not_started",
        "review": "not_started",
        "security": "not_started",
        "test": "not_started",
        "documentation": "not_started"
      },
      "createdAt": "2026-07-01T00:00:00Z"
    }
  ]
}
```

### POST /api/projects

**Request**

```json
{ "name": "案件A" }
```

**Response 201**

```json
{
  "id": "uuid",
  "name": "案件A",
  "currentStage": "requirements",
  "overallStatus": "in_progress"
}
```

※ 作成時、サーバー側で7工程分の`project_stages`レコードを`status: not_started`で一括作成する（詳細はC4参照）。

### GET /api/projects/:id

**Response 200**

```json
{
  "id": "uuid",
  "name": "案件A",
  "overallStatus": "in_progress",
  "currentStage": "design",
  "stages": [
    { "stageKey": "requirements", "status": "completed" },
    { "stageKey": "design", "status": "in_progress" }
  ]
}
```

**エラー**: `404`（存在しない）、`403`（他組織の案件）

### GET /api/projects/:id/stages/:stageKey

**Response 200**

```json
{
  "stageKey": "design",
  "status": "in_progress",
  "questions": [{ "id": "q1", "text": "...", "order": 1 }],
  "answers": { "q1": "回答内容" },
  "generatedPrompt": "...",
  "deliverable": {
    "id": "uuid",
    "version": 2,
    "content": "...",
    "generationMethod": "manual"
  },
  "qualityGateItems": [{ "id": "item1", "label": "...", "order": 1 }],
  "qualityGateResult": { "item1": { "checked": true } }
}
```

**エラー**: `404`（存在しない）、`403`（他組織の案件）

### POST /api/projects/:id/stages/:stageKey/answers

**Request**

```json
{ "answers": { "q1": "回答内容...", "q2": "回答内容..." } }
```

**Response 200**

```json
{ "projectStageId": "uuid", "status": "in_progress" }
```

**エラー**: `404`（案件/工程が存在しない）、`403`（他組織の案件）

### POST /api/projects/:id/stages/:stageKey/generate-prompt

**Request**: なし（保存済みanswersを使用）
**Response 200**

```json
{ "generatedPrompt": "..." }
```

**エラー**: `409`（未回答の必須質問がある場合）

### POST /api/projects/:id/stages/:stageKey/execute

アプリ内でAI実行する場合のみ呼び出す（`execution_mode: ai_executed`を選んだ場合の専用エンドポイント。リクエストボディなし）
**Response 200**

```json
{
  "deliverableId": "uuid",
  "version": 1,
  "content": "...",
  "generationMethod": "ai_executed",
  "tokensUsed": { "input": 1200, "output": 800 }
}
```

**エラー**: `502`（Anthropic API呼び出し失敗）、`429`（レート制限）

### PATCH /api/projects/:id/stages/:stageKey/deliverable

`execution_mode: prompt_only`で外部生成した内容を貼り付ける場合、および既存成果物を編集する場合の両方で使用する。保存のたびに新しい`version`の行が追記され、`generationMethod`は常に`manual`として記録される。
**Request**

```json
{ "content": "貼り付け・編集後の内容" }
```

**Response 200**

```json
{ "deliverableId": "uuid", "version": 2, "generationMethod": "manual" }
```

### POST /api/projects/:id/stages/:stageKey/quality-gate

送信された`checkedItemIds`は、通過判定の結果によらず**毎回`quality_gate_result`に上書き保存する**（チェック状態がリロードで失われないようにするため）。
**Request**

```json
{ "checkedItemIds": ["item1", "item2", "item3"] }
```

**Response 200（全項目通過・次工程がある場合）**

```json
{ "passed": true, "nextStage": "design", "projectCompleted": false }
```

**Response 200（全項目通過・最終工程＝ドキュメントの場合）**

```json
{ "passed": true, "nextStage": null, "projectCompleted": true }
```

※ 最終工程を通過した場合、`nextStage`は`null`となり、`projects.overall_status`が`completed`に更新される（次工程の`project_stages`レコードは存在しないため作成しない）。
**Response 200（未通過）**

```json
{ "passed": false, "missingItemIds": ["item4"] }
```

※ 未通過の場合も`quality_gate_result`への保存は行われる（`project_stages.status`は`quality_gate_pending`のまま維持）。

### GET/PUT /api/admin/templates/:stageKey

管理者ロールのみアクセス可（`403`：一般利用者がアクセスした場合）。PUTは新バージョンを追記する形で保存する。
**GET Response 200**

```json
{
  "stageKey": "design",
  "questions": [{ "id": "q1", "text": "...", "order": 1 }],
  "promptTemplate": "...{{answer:q1}}...",
  "qualityGateItems": [{ "id": "item1", "label": "...", "order": 1 }],
  "version": 3
}
```

**PUT Request**：GETと同じ形式のボディを送信（`version`は不要。サーバー側で自動採番）
**PUT Response 200**

```json
{ "version": 4 }
```

### GET /api/admin/users

管理者ロールのみアクセス可。
**Response 200**

```json
{
  "users": [
    {
      "id": "uuid",
      "email": "a@example.com",
      "role": "user",
      "status": "active",
      "displayName": "山田"
    }
  ]
}
```

### POST /api/admin/users

組織内メンバーを招待する。Identity Platform側にユーザーを作成し、招待メール（パスワード設定リンク付き）を送信する。
**Request**

```json
{ "email": "new@example.com", "role": "user", "displayName": "新しいメンバー" }
```

**Response 201**

```json
{ "id": "uuid", "email": "new@example.com", "role": "user", "status": "active" }
```

**エラー**: `409`（同一メールアドレスが既に存在）

### PATCH /api/admin/users/:id

ロール変更、またはアカウントの無効化／再有効化に使用する。
**Request（例：無効化）**

```json
{ "status": "disabled" }
```

**Response 200**

```json
{ "id": "uuid", "status": "disabled" }
```

---

## C3. 画面ごとのコンポーネント構成

### ログイン画面

- `LoginForm`（メール／パスワード入力、Identity Platform SDKの`signIn`呼び出し）
- `ForgotPasswordLink`（パスワードリセットのメール送信フローへの導線）
- `ErrorMessage`

### 案件一覧画面

- `ProjectListHeader`（新規作成ボタン）
- `ProjectCard`（案件名／7工程の進捗バー／作成日）
- `NewProjectModal`

### 案件詳細画面（工程別進行画面）

- `StageTabBar`（7工程タブ。完了済み／現在地／未着手をステータス色分け）
- `StageQuestionForm`（質問セットを動的にレンダリング）
- `PromptPreview`（生成プロンプトの表示・コピー機能）
- `ExecutionModeToggle`（「プロンプト出力のみ」／「アプリ内実行」の切り替え）
- `DeliverableEditor`（成果物の表示・編集。Markdownエディタを想定）
- `QualityGateChecklist`（チェック項目一覧。全チェックで「次工程へ」ボタンが活性化）

### テンプレート管理画面（管理者用）

- `StageSelector`（7工程の選択タブ）
- `QuestionSetEditor`（質問の追加・編集・削除・並べ替え）
- `PromptTemplateEditor`（テキストエリア。回答プレースホルダーの挿入補助）
- `QualityGateItemsEditor`（チェック項目の追加・編集・削除）
- `VersionHistoryPanel`（過去バージョンの確認）

### ユーザー管理画面（管理者用）

- `UserListTable`（メンバー一覧。ロール・ステータス表示）
- `InviteUserModal`（メールアドレス・ロールを指定して招待）
- `RoleSelect`（ロール変更）
- `DisableUserButton`（アカウント無効化／再有効化）

---

## C4. 主要ロジック設計

### 案件作成時の初期化ロジック

1. `projects`レコードを作成（`current_stage: requirements`, `overall_status: in_progress`）
2. 工程マスタ定義の7つの`stage_key`分、`project_stages`レコードを一括作成（すべて`status: not_started`）

### プロンプト組み立てロジック

1. `project_stages.answers`（JSONB）を取得
2. 該当`organization_id`＋`stage_key`の`prompt_templates`のうち最新`version`を取得
3. テンプレート内のプレースホルダー（`{{answer:質問ID}}`形式）を回答内容で置換
4. 置換後のテキストを`generated_prompt`として`project_stages`に保存し返却（版管理はせず上書き）

### 品質ゲート判定ロジック

1. `stage_key`に紐づく`quality_gate_items`の最新バージョンの項目一覧を取得
2. リクエストの`checkedItemIds`を`quality_gate_result`に上書き保存する（通過判定の結果によらず、常に保存する）
3. 全項目が`checkedItemIds`に含まれているか判定
4. **全項目通過の場合**：該当`project_stages.status`を`completed`に更新
   - 次の`stage_key`が存在する場合：次工程の`project_stages.status`を`in_progress`に更新し、`projects.current_stage`を更新して`{ passed: true, nextStage: 次stage_key, projectCompleted: false }`を返す
   - 次の`stage_key`が存在しない（最終工程＝documentation）場合：`projects.overall_status`を`completed`に更新し、`{ passed: true, nextStage: null, projectCompleted: true }`を返す
5. **一部未達成の場合**：`project_stages.status`は`quality_gate_pending`のまま維持し、`{ passed: false, missingItemIds: [...] }`を返す（`quality_gate_result`の保存は手順2で完了済み）

### AI実行ロジック（アプリ内実行時）

1. `generated_prompt`を取得
2. Anthropic APIを呼び出し（シンプルな1ターン呼び出しを想定。ツール利用なし）
3. レスポンス内容を`deliverables`に新バージョンとして保存（`generation_method: ai_executed`）
4. トークン使用量を`api_usage_logs`に記録

---

## C5. プロンプトテンプレート実装例（工程1：要件定義）

`prompt_templates`テーブルに実際に投入するテンプレート文の例。A7の質問セット（8問）とA8の品質ゲート（5項目）をそのまま組み込んでいる。

```
あなたは経験豊富なITコンサルタント兼PMです。以下のヒアリング回答をもとに、この案件の要件定義書を作成してください。

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
- [ ] 顧客・関係者の合意状況が分かる（未確認なら「要確認」と明記）
```

**設計意図**

- 「勝手に補完しない」を強く指示しているのは、AIが情報不足を自然な文章で埋めてしまい、誤った前提のまま設計工程に進んでしまうリスクを避けるため
- 品質チェックをプロンプト自体に含めることで、AIの一次出力の時点である程度A8の基準を満たそうとする状態にし、人間のレビュー負荷を下げる
- 他の6工程（設計〜ドキュメント）も同じ構造（ヒアリング回答の埋め込み→構成指定→遵守事項→品質チェック）で作成すれば、テンプレート間の一貫性を保てる

---
