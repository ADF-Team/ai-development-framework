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

| ロール                 | できること                                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| 利用者（エンジニア）   | 案件を作成・選択し、工程を進める。質問に回答し、プロンプト生成・実行・成果物編集を行う。公開テンプレートの一覧・詳細を閲覧できる（閲覧のみ） |
| 管理者                 | 7工程それぞれの「質問セット」「プロンプトテンプレート」「品質ゲートのチェック項目」を編集・バージョン管理する。テンプレートの公開／非公開の切り替え、公開テンプレートのマイテンプレートへの複製を行う |
| システム管理者         | 管理者の権限をすべて含む上位ロール。加えて、会社（組織）の作成・編集・無効化を行える（他社の案件・テンプレート・ユーザーの中身は見られない。会社のメタ情報の管理のみ） |

※ v1では「利用者」「管理者」は同一人物が兼ねてもよいが、権限は分けておく。システム管理者は将来の他社ライセンス提供（Phase3）を見据えたロールで、v1では自社（最初の1組織）の運用者が兼ねる想定。

## A4. 画面一覧（存在すべき画面。詳細レイアウトはPart Cで扱う）

1. ログイン画面
2. 案件一覧画面（進行中・完了案件と、7工程の進捗ステータス表示）
3. 案件詳細画面（工程別進行画面：質問フォーム／プロンプト表示／実行モード切替／成果物表示・編集／品質ゲート判定）
4. マイテンプレート一覧画面（管理者用：7工程分のテンプレート概要一覧。工程を選択してテンプレート詳細画面へ）
5. テンプレート詳細画面（管理者用：工程ごとの質問セット・プロンプトテンプレート・品質ゲート項目の編集、バージョン履歴・差分確認）
6. ユーザー管理画面（管理者用：メンバー招待・ロール変更・アカウント無効化）
7. 公開テンプレート一覧画面（全ユーザー閲覧可：公開されたテンプレートの一覧。クリックで公開テンプレート詳細画面へ）
8. 公開テンプレート詳細画面（全ユーザー閲覧可：公開テンプレートの7工程分の内容を閲覧。管理者には「マイテンプレートに追加」ボタンを表示）
9. 会社管理画面（システム管理者用：会社（組織）の作成・編集・無効化。作成時に初期管理者を同時に招待する）

※ ログイン画面以外は共通のサイドバーナビゲーション（`AppSidebar`）を持つ。グループ構成・ロール別の表示項目はC3を参照。

## A5. 機能要件一覧

| #   | 機能                         | 概要                                                                                     |
| --- | ---------------------------- | ---------------------------------------------------------------------------------------- |
| F1  | 案件管理                     | テンプレートを選択した案件の作成・一覧表示・工程別進捗ステータスの表示                   |
| F2  | 工程別ガイド付き質問フォーム | 工程ごとに用意された質問に回答する形式のフォーム                                         |
| F3  | プロンプト自動生成           | 質問への回答をテンプレートに埋め込み、その工程用のプロンプトを組み立てる                 |
| F4  | 実行モード切り替え           | 「プロンプトのみ出力（コピー用）」／「アプリ内でAI実行し成果物まで生成」を選択可能にする |
| F5  | 成果物の保存・編集           | 生成された成果物（文章・コード等）をDBに保存し、あとから参照・編集できる                 |
| F6  | 品質ゲート制御               | チェックリスト形式の通過条件を満たさないと次工程に進めないようにする                     |
| F7  | マイテンプレート             | 管理者がテンプレート（7工程分の質問セット・プロンプトテンプレート・品質ゲート項目のパック）を複数作成・編集し、バージョン履歴・差分を確認できる。案件はテンプレートを選択して作成する |
| F8  | 認証                         | 社内複数人がログインして利用できる                                                       |
| F9  | ユーザー管理                 | 管理者がメンバーを招待し、ロール（利用者／管理者）の設定・アカウントの無効化を行える     |
| F10 | テンプレート公開             | 管理者がテンプレートを公開／非公開に切り替える。公開中は全ユーザーが公開テンプレート画面から閲覧できる |
| F11 | 公開テンプレートの複製       | 管理者が公開テンプレートの内容を独立したコピーとしてマイテンプレートに追加できる（既存の複製機能と同じロジック） |
| F12 | 会社管理                     | システム管理者が会社（組織）を作成（初期管理者を同時に招待）・編集・無効化できる         |

## A6. 業務データ（概念レベル：どんな情報を扱うか。テーブル設計はPart Cで扱う）

- **案件**：案件名、作成日、参照するテンプレート、現在の工程、全体ステータス
- **工程の進行状況**：案件×工程ごとの状態、回答内容、生成プロンプト、成果物、品質ゲート判定結果
- **テンプレート**：テンプレート名、7工程分の質問セット・プロンプトテンプレート・品質ゲート項目のパック。複数作成でき、案件は作成時にどれか1つを選ぶ。公開／非公開の状態を持ち、公開中は全ユーザーが閲覧できる。他の公開テンプレートを複製して作られた場合は、複製元の参照を保持する（将来組織をまたいだ公開・複製にも対応できるようにするため）
- **質問セット**：テンプレート内・工程ごとの質問項目一覧
- **プロンプトテンプレート**：テンプレート内・工程ごとのプロンプト雛形
- **品質ゲート項目**：テンプレート内・工程ごとのチェック項目一覧
- **成果物**：工程に紐づく生成物（本文、生成方式、編集履歴）
- **会社（組織）**：会社名、有効／無効化ステータス。案件・テンプレート・ユーザーはすべていずれかの会社に属する（v1では1社のみ運用するが、複数社を見据えたデータ構造）
- **ユーザー**：利用者／管理者／システム管理者の権限。所属する会社

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

- **最初のシステム管理者の作成**：システム管理者が誰もいない状態からは会社も作れないため、最初の会社（自社）と最初のシステム管理者アカウントは、アプリのUIを介さず、デプロイ時のシードスクリプト（Terraform適用後に1回だけ実行）またはIdentity Platformコンソールから直接作成する
- **2社目以降の会社・初期管理者の作成**：システム管理者が会社管理画面から会社名と初期管理者のメールアドレスを入力して作成する（詳細はA4・C4参照）。以降のシードスクリプトは不要
- **アカウント発行（各社の2人目以降）**：セルフサインアップは無効。管理者画面からメールアドレスとロール（利用者／管理者）を指定して招待する。招待メールには本人がパスワードを設定するためのリンクを含める（管理者がパスワードを決めて渡すことはしない）
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
  ├─ 新規案件作成（案件名を入力＋テンプレートを選択） → 案件詳細（工程1から開始）
  └─ 既存案件を選択 → 案件詳細（現在の工程から再開）

案件詳細（工程タブ：要件定義〜ドキュメント）
  質問フォーム回答 → プロンプト生成 → 実行モード選択
    ├─ プロンプトのみ出力（コピー用モーダル）
    └─ アプリ内実行 → 成果物表示・編集
  → 品質ゲートチェック → 通過 → 次工程タブへ
  ※質問セット・プロンプトテンプレート・品質ゲート項目は、案件が参照するテンプレートの現在有効な版から取得する（テンプレート編集は進行中の案件にも反映される）

（別動線）管理者メニュー → マイテンプレート一覧（テンプレートのカード一覧）
  ├─ 新規作成（テンプレート名を入力） → テンプレート詳細（工程1から編集開始。7工程とも空の内容）
  ├─ カードの「複製する」→ 現在有効な版の内容をコピーした新規テンプレートを作成（バージョン履歴はリセット。既存の案件には影響しない）
  ├─ カードの「公開する」→ 確認モーダル（「ADFを使う人全員が見れるようになりますがよいですか」）→ 続行 → 公開状態になる（カードには「公開中」タグ＋「公開を取り下げる」ボタンが表示される）
  ├─ 公開テンプレートを複製して作られたカード（未編集の場合）→「公開テンプレート」タグを表示し「公開する」ボタンは非表示（新バージョンを保存すると通常のカード表示に戻る）
  └─ 既存テンプレートを選択 → テンプレート詳細（工程タブで7工程を切り替え）
      質問セット／プロンプトテンプレート／品質ゲート項目を編集 → 保存ボタン
        ├─ このテンプレートを参照する進行中の案件がある場合 → 影響確認モーダル（対象案件一覧を表示）→ 続行 → 保存（テンプレート全体を新バージョンとして追記）
        └─ 参照している進行中の案件がない場合 → そのまま保存
      ├─ バージョン履歴から過去バージョンを選択 → 差分モーダルで1つ前のバージョンとの差分を確認
      └─ 「このテンプレートで案件を作成する」→ 案件一覧（新規案件作成モーダルがこのテンプレート選択済みで開く）

（全ユーザー利用可）公開テンプレート一覧 → カードを選択 → 公開テンプレート詳細（7工程分の内容を閲覧のみ）
  └─（管理者のみ）「マイテンプレートに追加」→ 独立したコピーを作成 → マイテンプレート一覧（複製されたカードに「公開テンプレート」タグ付きで表示）
```

## B6. API設計（ドラフト・主要エンドポイント）

| メソッド | パス                                                 | 概要                                                                       |
| -------- | ---------------------------------------------------- | -------------------------------------------------------------------------- |
| GET      | `/api/projects`                                                  | 案件一覧取得                                                               |
| POST     | `/api/projects`                                                  | 案件作成（テンプレートを指定する）                                        |
| GET      | `/api/projects/:id`                                              | 案件詳細（工程別ステータス含む）取得                                       |
| GET      | `/api/projects/:id/stages/:stageKey`                             | 特定工程の質問・回答・プロンプト・成果物・品質ゲート状況を取得             |
| POST     | `/api/projects/:id/stages/:stageKey/answers`                     | 質問への回答を保存                                                         |
| POST     | `/api/projects/:id/stages/:stageKey/generate-prompt`             | 回答をテンプレートに埋め込みプロンプトを生成                               |
| POST     | `/api/projects/:id/stages/:stageKey/execute`                     | Claude APIを呼び出し、成果物を生成・保存                                   |
| PATCH    | `/api/projects/:id/stages/:stageKey/deliverable`                 | 成果物を編集・保存                                                         |
| POST     | `/api/projects/:id/stages/:stageKey/quality-gate`                | 品質ゲートのチェック結果を送信し、通過判定・次工程への移行を行う           |
| GET      | `/api/admin/templates`                                           | （管理者用）テンプレート概要一覧取得（マイテンプレート一覧画面用）         |
| POST     | `/api/admin/templates`                                           | （管理者用）テンプレート新規作成（7工程とも空の内容で初期化される）        |
| GET/PUT  | `/api/admin/templates/:templateId/stages/:stageKey`              | （管理者用）テンプレート名・指定工程の質問セット・プロンプトテンプレート・品質ゲート項目の取得／編集 |
| GET      | `/api/admin/templates/:templateId/stages/:stageKey/versions/:version` | （管理者用）テンプレートの特定バージョン・指定工程の内容取得（バージョン差分表示用） |
| GET      | `/api/admin/templates/:templateId/projects`                      | （管理者用）このテンプレートを参照している進行中の案件一覧取得（保存時の影響確認用） |
| POST     | `/api/admin/templates/:templateId/duplicate`                     | （管理者用）テンプレートの複製（現在有効な版の内容をコピーした新規テンプレートを作成）。公開テンプレートの複製元IDを指定した場合も同じロジックで動作する |
| POST     | `/api/admin/templates/:templateId/publish`                       | （管理者用）テンプレートを公開状態にする                                   |
| POST     | `/api/admin/templates/:templateId/unpublish`                     | （管理者用）テンプレートを非公開状態に戻す                                 |
| GET      | `/api/templates/published`                                       | （全ユーザー用）公開テンプレートの一覧取得                                 |
| GET      | `/api/templates/published/:templateId`                           | （全ユーザー用）公開テンプレートの詳細（7工程分の内容）取得                |
| GET      | `/api/admin/users`                                               | （管理者用）組織内メンバー一覧取得                                         |
| POST     | `/api/admin/users`                                               | （管理者用）メンバーを招待（メールアドレス・ロールを指定）                 |
| PATCH    | `/api/admin/users/:id`                               | （管理者用）ロール変更・アカウント無効化／再有効化                         |
| GET      | `/api/system/companies`                                          | （システム管理者用）会社（組織）一覧取得                                   |
| POST     | `/api/system/companies`                                          | （システム管理者用）会社を作成（会社名＋初期管理者のメールアドレスを指定。作成と同時に初期管理者を招待） |
| PATCH    | `/api/system/companies/:id`                                      | （システム管理者用）会社名の変更・有効化／無効化                           |

※ 認証はIdentity PlatformのSDKがクライアント側で発行するIDトークンをAPI Routes側で検証する方式（専用のログインAPIは持たない）

## B7. DBテーブル設計（ドラフト）

| テーブル              | 主なカラム                                                                                                                                                                  | 備考                                                                 |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `organizations`       | id, name, status（active/suspended）, created_at                                                                                                                            | v1では1組織のみだが最初から複数対応の構造で用意                     |
| `users`               | id, organization_id, email, role（user/admin/system_admin）, display_name, created_at                                                                                       | system_adminはadminの権限を包含する上位ロール                       |
| `templates`           | id, organization_id, published_at, source_published_template_id, created_at                                                                                                 | テンプレート（7工程分のパック）そのもの。複数作成できる。published_atが非NULLなら公開中。source_published_template_idは公開テンプレートを複製して作られた場合の複製元（将来組織をまたいだ複製にも対応） |
| `template_versions`   | id, template_id, title, version, created_by, created_at                                                                                                                     | 追記型。titleはテンプレート名。1回の保存で7工程分まとめて新版になる  |
| `projects`            | id, organization_id, name, template_id, current_stage, overall_status, created_by, created_at                                                                              | template_idが参照するテンプレートは常に最新版で参照される（ライブ参照） |
| `project_stages`      | id, project_id, stage_key（7工程のenum）, status（未着手/進行中/品質ゲート待ち/完了）, answers（json）, generated_prompt（text）, quality_gate_result（json）, completed_at | 案件×工程の1レコード                                                 |
| `deliverables`        | id, project_stage_id, content（text）, generation_method（manual/ai_executed）, version, updated_by, updated_at                                                             | 編集履歴はversionで管理。値の詳細はC2.0参照                          |
| `question_templates`  | id, template_version_id, stage_key, questions（json配列）                                                                                                                   | template_versions 1件×7工程分のレコードを持つ                        |
| `prompt_templates`    | id, template_version_id, stage_key, template_text                                                                                                                           | template_versions 1件×7工程分のレコードを持つ                        |
| `quality_gate_items`  | id, template_version_id, stage_key, items（json配列）                                                                                                                       | template_versions 1件×7工程分のレコードを持つ                        |
| `api_usage_logs`      | id, project_stage_id, organization_id, tokens_used, cost_estimate, called_at                                                                                                | コスト可視化用                                                       |

---

**Part B（基本設計）は上記B1〜B7をもって、ひとまず完了とする（たたき台段階。実装しながら見直す前提）。**

---

# Part C. 詳細設計（内部の作り）

**状態：ドラフト完了（実装しながら見直す前提）**

## C1. テーブル定義（詳細）

版管理が必要なテーブル（`deliverables`／`template_versions`）は、更新のたびに新しい行を追加する**追記型（Append-only）**とし、`version`の最大値が「現在有効な版」となる設計にする。`question_templates`／`prompt_templates`／`quality_gate_items`は`template_versions`にぶら下がる形で、版そのものは持たない（1つの`template_versions`行＝1つの版につき、7工程分のレコードを持つ）。

### organizations

| カラム     | 型                          | 制約                          |
| ---------- | --------------------------- | ----------------------------- |
| id         | UUID                        | PK, default gen_random_uuid() |
| name       | VARCHAR(255)                | NOT NULL                      |
| status     | ENUM('active','suspended')  | NOT NULL, default 'active'    |
| created_at | TIMESTAMPTZ                 | NOT NULL, default now()       |

### users

| カラム                | 型                                    | 制約                          |
| --------------------- | -------------------------------------- | ----------------------------- |
| id                    | UUID                                   | PK                            |
| organization_id       | UUID                                   | NOT NULL, FK→organizations.id |
| identity_platform_uid | VARCHAR(128)                           | NOT NULL, UNIQUE              |
| email                 | VARCHAR(255)                           | NOT NULL, UNIQUE              |
| role                  | ENUM('user','admin','system_admin')    | NOT NULL, default 'user'      |
| display_name          | VARCHAR(100)                           |                               |
| status                | ENUM('active','disabled')              | NOT NULL, default 'active'    |
| created_at            | TIMESTAMPTZ                            | NOT NULL, default now()       |

INDEX: `organization_id`

`system_admin`は`admin`の権限をすべて含む上位ロール（自組織の案件・マイテンプレート・ユーザー管理に加え、会社管理画面にアクセスできる）。権限チェックは「`admin`専用機能：`role`が`admin`または`system_admin`」「会社管理機能：`role`が`system_admin`」という2段階で行う。

### templates

| カラム                       | 型          | 制約                                             |
| ----------------------------- | ----------- | ------------------------------------------------ |
| id                            | UUID        | PK, default gen_random_uuid()                    |
| organization_id               | UUID        | NOT NULL, FK→organizations.id                    |
| published_at                  | TIMESTAMPTZ | NULL可。非NULLなら公開中（公開テンプレート一覧に表示される） |
| source_published_template_id  | UUID        | NULL可, FK→templates.id。公開テンプレートを複製して作られた場合の複製元 |
| created_at                    | TIMESTAMPTZ | NOT NULL, default now()                          |

INDEX: `organization_id` ／ `published_at`（公開テンプレート一覧の絞り込み用）

「公開テンプレート」タグの表示条件（`マイテンプレート一覧`画面）：`source_published_template_id`が非NULL、かつこのテンプレートの`template_versions`が1件のみ（未編集）の場合に表示する。新しいバージョンが保存された時点（`template_versions`が2件以上になった時点）でタグは消え、通常の「公開する」ボタンが表示される。

### template_versions（追記型）

| カラム      | 型           | 制約                      |
| ------------ | ------------ | -------------------------- |
| id          | UUID         | PK                         |
| template_id | UUID         | NOT NULL, FK→templates.id  |
| title       | VARCHAR(255) | NOT NULL。テンプレート名   |
| version     | INTEGER      | NOT NULL                   |
| created_by  | UUID         | FK→users.id                |
| created_at  | TIMESTAMPTZ  | NOT NULL                   |

UNIQUE: `(template_id, version)`

### projects

| カラム                  | 型                              | 制約                             |
| ----------------------- | ------------------------------- | -------------------------------- |
| id                      | UUID                            | PK                               |
| organization_id         | UUID                            | NOT NULL, FK                     |
| name                    | VARCHAR(255)                    | NOT NULL                         |
| template_id             | UUID                            | NOT NULL, FK→templates.id。案件が参照するテンプレート（常に最新版を参照する） |
| current_stage           | ENUM(7工程キー)                 | NOT NULL, default 'requirements' |
| overall_status          | ENUM('in_progress','completed') | NOT NULL, default 'in_progress'  |
| created_by              | UUID                            | FK→users.id                      |
| created_at / updated_at | TIMESTAMPTZ                     | NOT NULL                         |

INDEX: `organization_id`, `overall_status`, `template_id`

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

### question_templates / prompt_templates / quality_gate_items（管理者編集用。版そのものはtemplate_versionsが持つ）

| カラム                            | 型              | 制約                                                                                                                                  |
| --------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| id                                | UUID            | PK                                                                                                                                    |
| template_version_id               | UUID            | NOT NULL, FK→template_versions.id                                                                                                    |
| stage_key                         | ENUM(7工程キー) | NOT NULL                                                                                                                              |
| questions / template_text / items | JSONB or TEXT   | 内容本体。`questions`の各要素は`{id, text, order}`（例：`{"id":"q1","text":"...","order":1}`）。`items`の各要素は`{id, label, order}` |

UNIQUE: `(template_version_id, stage_key)`

新しいバージョンを保存する際は、編集した工程だけでなく7工程分すべての行を新しい`template_version_id`に紐づけて複製する（未編集の6工程は直前バージョンの内容をそのままコピーする）。

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
|                                                                   |      | `admin`                | マイテンプレートの編集も可能な管理者                     |
|                                                                   |      | `system_admin`         | adminの権限を包含し、会社管理画面にもアクセスできる上位ロール |
| `users.status`                                                    | ENUM | `active`               | ログイン可能                                             |
|                                                                   |      | `disabled`             | 無効化済み（退職者等）                                   |
| `organizations.status`                                            | ENUM | `active`               | ログイン・利用可能                                       |
|                                                                   |      | `suspended`            | 無効化済み（この会社に属する全ユーザーがログイン不可になる） |

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
{ "name": "案件A", "templateId": "uuid" }
```

**Response 201**

```json
{
  "id": "uuid",
  "name": "案件A",
  "overallStatus": "in_progress",
  "currentStage": "requirements",
  "stageStatuses": {
    "requirements": "in_progress",
    "design": "not_started",
    "implementation": "not_started",
    "review": "not_started",
    "security": "not_started",
    "test": "not_started",
    "documentation": "not_started"
  },
  "createdAt": "2026-07-24"
}
```

**エラー**: `404`（存在しないtemplateIdを指定した場合）

`name`は1〜255文字（`projects.name`のVARCHAR(255)に合わせる）。クライアント側（`newProjectFormSchema`）でバリデーションする。

※ 作成時、サーバー側で7工程分の`project_stages`レコードを`status: not_started`で一括作成する（工程1のみ`in_progress`）。案件は`templateId`を保持し、以降の質問セット・プロンプトテンプレート・品質ゲート項目は常にこのテンプレートの現在有効な版を参照する（詳細はC4参照）。

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

### GET /api/admin/templates

管理者ロールのみアクセス可。マイテンプレート一覧画面用に、テンプレート概要（現在有効な版の情報のみ）をまとめて返す。
**Response 200**

```json
{
  "templates": [
    {
      "id": "uuid",
      "title": "標準テンプレート",
      "version": 3,
      "updatedAt": "2026-07-10",
      "updatedBy": "山田"
    }
  ]
}
```

### POST /api/admin/templates

管理者ロールのみアクセス可。新規テンプレートを作成する。7工程とも空の内容（質問セット・プロンプトテンプレート・品質ゲート項目なし）で初期化される。
**Request**

```json
{ "title": "Webアプリ案件用テンプレート" }
```

**Response 201**

```json
{ "id": "uuid", "version": 1 }
```

`title`は1〜255文字（`template_versions.title`のVARCHAR(255)に合わせる）。クライアント側（`newTemplateFormSchema`）でバリデーションする。

### GET/PUT /api/admin/templates/:templateId/stages/:stageKey

管理者ロールのみアクセス可（`403`：一般利用者がアクセスした場合）。PUTはテンプレート全体（テンプレート名＋指定工程の内容）を新バージョンとして追記する形で保存する（編集していない他の6工程の内容は、直前バージョンからそのまま引き継がれる）。
**GET Response 200**

```json
{
  "templateId": "uuid",
  "stageKey": "design",
  "title": "標準テンプレート",
  "questions": [{ "id": "q1", "text": "...", "order": 1 }],
  "promptTemplate": "...{{answer:q1}}...",
  "qualityGateItems": [{ "id": "item1", "label": "...", "order": 1 }],
  "version": 3,
  "versions": [
    { "version": 3, "createdAt": "2026-07-10", "createdBy": "山田" },
    { "version": 2, "createdAt": "2026-05-02", "createdBy": "田中" },
    { "version": 1, "createdAt": "2026-02-14", "createdBy": "山田" }
  ]
}
```

※ `title`はテンプレート名（テンプレート詳細画面の見出し・マイテンプレート一覧のカード見出しに使用）。どの工程タブから見ても同じ値（テンプレート単位で1つ）。

※ `version`／`versions`はテンプレート全体で共有される版番号・履歴（特定の工程だけの版ではない）。バージョン履歴パネル・差分モーダル表示用にGETレスポンスへ含めている（`versions`はバージョン番号の降順）。

**PUT Request**：GETと同じ形式のボディを送信（`version`・`versions`は不要。サーバー側で自動採番）。`title`は1〜255文字（`newTemplateFormSchema`と同じ`stageTemplateFormSchema`のルールでクライアント側バリデーションする）。
**PUT Response 200**

```json
{ "version": 4 }
```

### GET /api/admin/templates/:templateId/stages/:stageKey/versions/:version

管理者ロールのみアクセス可。バージョン履歴パネルで特定バージョンをクリックした際、差分モーダル表示のために該当バージョン・指定工程の内容を取得する。
**Response 200**

```json
{
  "templateId": "uuid",
  "stageKey": "design",
  "title": "標準テンプレート",
  "questions": [{ "id": "q1", "text": "...", "order": 1 }],
  "promptTemplate": "...{{answer:q1}}...",
  "qualityGateItems": [{ "id": "item1", "label": "...", "order": 1 }],
  "version": 2
}
```

**エラー**: `404`（存在しないテンプレートID・バージョン番号を指定した場合）

差分表示は、選択したバージョンと1つ前のバージョン（`version - 1`）をそれぞれ本APIで取得し、クライアント側で行単位の差分（`diff`パッケージの`diffLines`）を計算して表示する（テンプレート名・質問セット・プロンプトテンプレート・品質ゲート項目の4セクション）。初版（`version === 1`）を選択した場合は、比較対象が存在しないため空の内容と比較し、全内容が新規追加として表示される。

### GET /api/admin/templates/:templateId/projects

管理者ロールのみアクセス可。テンプレート詳細画面で保存ボタンを押した際、このテンプレートを参照している**進行中**（`overall_status: in_progress`）の案件一覧を取得し、影響確認モーダルの表示要否・内容を判定するために使う（完了済み案件は対象外）。
**Response 200**

```json
{
  "projects": [
    { "id": "uuid", "name": "ECサイトリニューアル" }
  ]
}
```

`projects`が1件以上ある場合、クライアント側で`SaveImpactModal`を表示し、管理者が続行を確認してから`PUT /api/admin/templates/:templateId/stages/:stageKey`を呼ぶ。0件の場合は確認なしでそのまま保存する。

### POST /api/admin/templates/:templateId/duplicate

管理者ロールのみアクセス可。現在有効な版（7工程分）の内容をコピーした新規テンプレートを作成する。複製先はバージョン1から始まる独立したテンプレートで、複製元のバージョン履歴は引き継がない。既存の案件が参照しているテンプレートには影響しない（案件のテンプレート差し替えは行わない）。
**Response 201**

```json
{ "id": "uuid", "version": 1 }
```

複製されたテンプレートの`title`は、複製元のタイトルに「のコピー」を付与した値になる（例：「標準テンプレート」→「標準テンプレートのコピー」）。マイテンプレート一覧画面の`TemplateCard`にある「複製する」ボタンから呼ばれ、成功後は複製されたテンプレートの詳細画面（工程1）へ遷移する。

公開テンプレート詳細画面の「マイテンプレートに追加」ボタンからも同じエンドポイントを呼ぶ（`:templateId`に公開テンプレートのIDを指定する）。この場合、複製先テンプレートの`source_published_template_id`に複製元のIDを記録する（`published_at`は複製先には引き継がず、複製先は非公開の状態で作成される）。

### POST /api/admin/templates/:templateId/publish

管理者ロールのみアクセス可。テンプレートを公開状態にする（`templates.published_at`を現在時刻に更新）。
**Response 200**

```json
{ "id": "uuid", "publishedAt": "2026-07-24T00:00:00Z" }
```

### POST /api/admin/templates/:templateId/unpublish

管理者ロールのみアクセス可。テンプレートを非公開状態に戻す（`templates.published_at`を`null`に更新）。既にこのテンプレートを複製して作られた他のテンプレート（`source_published_template_id`が本テンプレートを指すもの）には影響しない。
**Response 200**

```json
{ "id": "uuid", "publishedAt": null }
```

### GET /api/templates/published

管理者・利用者ともにアクセス可。公開中（`published_at`が非NULL）のテンプレート一覧を、名称・現在バージョン・公開日時付きで返す。
**Response 200**

```json
{
  "templates": [
    { "id": "uuid", "title": "標準テンプレート", "version": 3, "publishedAt": "2026-07-20T00:00:00Z" }
  ]
}
```

### GET /api/templates/published/:templateId

管理者・利用者ともにアクセス可。公開テンプレートの現在有効な版の内容（7工程分の質問セット・プロンプトテンプレート・品質ゲート項目）を返す。非公開のテンプレートIDを指定した場合は`404`。
**Response 200**

```json
{
  "id": "uuid",
  "title": "標準テンプレート",
  "version": 3,
  "publishedAt": "2026-07-20T00:00:00Z",
  "stages": [
    {
      "stageKey": "requirements",
      "questions": [{ "id": "q1", "text": "...", "order": 1 }],
      "promptTemplate": "...{{answer:q1}}...",
      "qualityGateItems": [{ "id": "item1", "label": "...", "order": 1 }]
    }
  ]
}
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

### GET /api/system/companies

システム管理者ロールのみアクセス可。
**Response 200**

```json
{
  "companies": [
    { "id": "uuid", "name": "株式会社サンプル", "status": "active", "createdAt": "2026-07-01T00:00:00Z" }
  ]
}
```

### POST /api/system/companies

システム管理者ロールのみアクセス可。新しい会社（組織）を作成し、同時にその会社の初期管理者を招待する。

1. `organizations`レコードを作成（`status: active`）
2. 作成した`organization_id`に紐づく`users`レコードを作成（`role: admin`）
3. Identity Platform側にユーザーを作成し、招待メール（パスワード設定リンク付き）を送信する（既存の`POST /api/admin/users`と同じ招待ロジックを、新規作成した組織に対して実行する）

**Request**

```json
{
  "companyName": "株式会社サンプル",
  "adminEmail": "admin@example.com",
  "adminDisplayName": "山田太郎"
}
```

**Response 201**

```json
{ "id": "uuid", "name": "株式会社サンプル", "status": "active" }
```

**エラー**: `409`（同一メールアドレスが既に存在）

### PATCH /api/system/companies/:id

システム管理者ロールのみアクセス可。会社名の変更、または有効化／無効化に使用する。無効化（`status: suspended`）すると、この会社に属する全ユーザーがログイン不可になる（`users.status`は変更しない。ログイン時に所属組織の`status`もあわせてチェックする）。
**Request（例：無効化）**

```json
{ "status": "suspended" }
```

**Response 200**

```json
{ "id": "uuid", "status": "suspended" }
```

---

## C3. 画面ごとのコンポーネント構成

### 共通レイアウト（ログイン後の全画面）

- `AppSidebar`：3グループでナビゲーションを構成する

| グループ       | 項目               | 表示ロール                     | 遷移先               |
| -------------- | ------------------ | ------------------------------ | -------------------- |
| チームスペース | 案件一覧           | 利用者・管理者・システム管理者 | 案件一覧画面          |
|                | マイテンプレート   | 管理者・システム管理者         | マイテンプレート一覧画面 |
|                | ユーザー管理       | 管理者・システム管理者         | ユーザー管理画面      |
| ライブラリ     | 公開テンプレート   | 利用者・管理者・システム管理者 | 公開テンプレート一覧画面 |
| システム管理   | 会社管理           | システム管理者のみ             | 会社管理画面          |

利用者ロールでログインした場合、チームスペースグループには「案件一覧」のみが表示される（マイテンプレート・ユーザー管理は非表示）。ライブラリグループは常に表示される。システム管理グループは、システム管理者ロールでログインした場合のみ表示される（管理者・利用者には表示されない）。

### ログイン画面

- `LoginForm`（メール／パスワード入力、Identity Platform SDKの`signIn`呼び出し）
- `ForgotPasswordLink`（パスワードリセットのメール送信フローへの導線）
- `ErrorMessage`

### 案件一覧画面

- `ProjectListHeader`（新規作成ボタン）
- `ProjectCard`（案件名／7工程の進捗バー／作成日）
- `NewProjectModal`（案件名の入力欄と、テンプレートの選択欄（プルダウン）。テンプレート詳細画面の「このテンプレートで案件を作成する」から遷移した場合は選択済みの状態で開く。案件名は255文字まで）

### 案件詳細画面（工程別進行画面）

- `StageTabBar`（7工程タブ。完了済み／現在地／未着手をステータス色分け）
- `StageQuestionForm`（質問セットを動的にレンダリング）
- `PromptPreview`（生成プロンプトの表示・コピー機能）
- `ExecutionModeToggle`（「プロンプト出力のみ」／「アプリ内実行」の切り替え）
- `DeliverableEditor`（成果物の表示・編集。Markdownエディタを想定）
- `QualityGateChecklist`（チェック項目一覧。全チェックで「次工程へ」ボタンが活性化）

### マイテンプレート一覧画面（管理者用）

- `TemplateCard`（テンプレート名／現在バージョン／最終更新日時・更新者。クリックでテンプレート詳細画面（工程1）へ遷移。「複製する」ボタンで現在有効な版の内容をコピーした新規テンプレートを作成し、その詳細画面へ遷移する。公開状態に応じて以下のいずれかを表示：①未公開かつ公開テンプレート由来でない場合「公開する」ボタン②公開中の場合「公開中」タグ＋「公開を取り下げる」ボタン③公開テンプレートを複製した直後で未編集の場合「公開テンプレート」タグ（ボタンは非表示。新バージョン保存で①に戻る）。「公開する」クリック時は`PublishConfirmModal`を表示）
- `PublishConfirmModal`（「公開する」ボタン押下時に表示。「ADFを使う人全員が見れるようになりますがよいですか」の確認メッセージと、続行／キャンセルボタン）
- `NewTemplateModal`（テンプレート名の入力欄。作成後は7工程とも空の内容のテンプレート詳細画面（工程1）へ遷移する。テンプレート名は255文字まで）

### テンプレート詳細画面（管理者用）

- `StageSelector`（7工程の選択タブ。切り替えると同画面内で該当工程のテンプレート詳細に遷移する）
- テンプレート名入力欄（画面見出し。枠線付きの入力欄として表示し、編集可能であることが分かるようにする。工程名は小さなラベルとして上に表示する。初期値は工程名だが自由に編集できる。255文字まで）
- `QuestionSetEditor`（質問の追加・削除）
- `PromptTemplateEditor`（テキストエリア。回答プレースホルダーの挿入補助。縦幅は固定で、超過分は内部スクロール）
- `QualityGateItemsEditor`（チェック項目の追加・削除）
- `VersionHistoryPanel`（過去バージョンの一覧。バージョンをクリックするとVersionDiffModalを開く）
- `VersionDiffModal`（クリックしたバージョンと1つ前のバージョンの差分を、テンプレート名・質問セット・プロンプトテンプレート・品質ゲート項目ごとに行単位で表示するモーダル。追加行・削除行を色分けして表示する）
- 保存ボタン（画面見出しの右側に配置。テンプレート名・質問セット・プロンプトテンプレート・品質ゲート項目への変更をまとめて新バージョンとして保存する。個々の追加・削除操作では自動保存しない。保存前にこのテンプレートを参照する進行中の案件の有無を確認し、あれば`SaveImpactModal`を挟む）
- `SaveImpactModal`（保存ボタン押下時、このテンプレートを参照している進行中の案件が1件以上ある場合に表示。対象案件名の一覧と、保存すると各案件の質問セット・プロンプトテンプレート・品質ゲート項目も変わる旨を表示し、続行を確認する。対象案件がない場合はこのモーダルを挟まずそのまま保存する）
- 「このテンプレートで案件を作成する」ボタン（クリックで案件一覧画面へ遷移し、このテンプレートが選択済みの状態で新規案件作成モーダルが開く）

### ユーザー管理画面（管理者用）

- `UserListTable`（メンバー一覧。ロール・ステータス表示）
- `InviteUserModal`（メールアドレス・ロールを指定して招待）
- `RoleSelect`（ロール変更）
- `DisableUserButton`（アカウント無効化／再有効化）

### 公開テンプレート一覧画面（全ユーザー閲覧可）

- `PublishedTemplateCard`（テンプレート名／現在バージョン／公開日時。クリックで公開テンプレート詳細画面へ遷移）

### 公開テンプレート詳細画面（全ユーザー閲覧可）

- `StageSelector`（7工程の選択タブ。テンプレート詳細画面と共通のコンポーネントを流用し、読み取り専用モードで表示）
- 質問セット・プロンプトテンプレート・品質ゲート項目の読み取り専用ビュー（`QuestionSetEditor` `PromptTemplateEditor` `QualityGateItemsEditor`を読み取り専用モードで流用）
- `AddToMyTemplatesButton`（管理者権限（管理者・システム管理者）にのみ表示。クリックで独立したコピーを作成し、マイテンプレート一覧画面（複製されたテンプレートの詳細画面）へ遷移する）

### 会社管理画面（システム管理者用）

- `CompanyCard`（会社名／ステータス（有効／無効）／作成日。クリックで会社名編集・有効化／無効化の操作ができる）
- `NewCompanyModal`（会社名の入力欄、初期管理者のメールアドレス・表示名の入力欄。作成と同時に初期管理者へ招待メールが送信される。会社名は255文字まで）
- `SuspendCompanyModal`（無効化ボタン押下時に表示。「この会社に属する全ユーザーがログインできなくなりますがよいですか」の確認メッセージと、続行／キャンセルボタン）

---

## C4. 主要ロジック設計

### 案件作成時の初期化ロジック

1. リクエストの`templateId`が存在するか検証する（存在しない場合`404`）
2. `projects`レコードを作成（`template_id: リクエストのtemplateId`, `current_stage: requirements`, `overall_status: in_progress`）
3. 工程マスタ定義の7つの`stage_key`分、`project_stages`レコードを一括作成（すべて`status: not_started`。工程1のみ`in_progress`）

以降、この案件の質問セット・プロンプトテンプレート・品質ゲート項目は、常に`template_id`が指すテンプレートの現在有効な版（`template_versions`の最新`version`）を参照する（スナップショットはコピーしない＝ライブ参照。テンプレートを後から編集すると、進行中の案件にも反映される）。

### プロンプト組み立てロジック

1. `project_stages.answers`（JSONB）を取得
2. `project.template_id`から`template_versions`の最新`version`を取得し、その`id`＋`stage_key`に紐づく`prompt_templates`を取得
3. テンプレート内のプレースホルダー（`{{answer:質問ID}}`形式）を回答内容で置換
4. 置換後のテキストを`generated_prompt`として`project_stages`に保存し返却（版管理はせず上書き）

### 品質ゲート判定ロジック

1. `project.template_id`から`template_versions`の最新`version`を取得し、その`id`＋`stage_key`に紐づく`quality_gate_items`の項目一覧を取得
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

### テンプレート公開・非公開ロジック

1. `POST /publish`：`templates.published_at`を現在時刻に更新する。既に公開済みの場合はエラーにせず何もしない（冪等）
2. `POST /unpublish`：`templates.published_at`を`null`に更新する。既に非公開の場合も同様に冪等とする
3. 公開状態の変更は、このテンプレートを複製して作られた他のテンプレート（`source_published_template_id`が本テンプレートを指すもの）や、既にこのテンプレートを参照している案件（`projects.template_id`）には一切影響しない

### 公開テンプレートの複製ロジック（マイテンプレートに追加）

既存の「複製する」（`POST /api/admin/templates/:templateId/duplicate`）と同じ処理を、複製元が公開テンプレートである場合にも適用する。

1. 複製元テンプレートの現在有効な版（7工程分）の内容を取得する（非公開テンプレートIDが指定された場合は`404`）
2. 新規`templates`レコードを作成する。`source_published_template_id`に複製元のIDを設定し、`published_at`は`null`（非公開）で作成する
3. `template_versions`をバージョン1として作成し、複製元の内容（タイトルに「のコピー」を付与）・質問セット・プロンプトテンプレート・品質ゲート項目をコピーする
4. マイテンプレート一覧画面の`TemplateCard`は、`source_published_template_id`が非NULLかつ`template_versions`が1件のみのこのテンプレートに対して「公開テンプレート」タグを表示し、「公開する」ボタンを非表示にする
5. このテンプレートに対して新しいバージョンが保存される（`template_versions`が2件以上になる）と、以降は`source_published_template_id`の値に関わらず通常の「公開する」ボタンを表示する（タグは表示しない）

### 会社作成時の初期化ロジック

1. リクエストの`adminEmail`が既存ユーザーと重複していないか検証する（重複時`409`）
2. `organizations`レコードを作成（`status: active`）
3. 作成した`organization_id`に紐づく`users`レコードを作成（`role: admin`, `status: active`）
4. Identity Platform側にユーザーを作成し、招待メール（パスワード設定リンク付き）を送信する（`POST /api/admin/users`の招待ロジックを再利用し、対象組織を新規作成した組織に差し替えて実行する）
5. 上記2〜4のいずれかが失敗した場合はロールバックする（会社だけ作成されて初期管理者が存在しない、という不整合な状態を防ぐ）

### ログイン時の組織ステータスチェック

`getCurrentUser`相当の共通処理で、ユーザー本人の`status`（`active`／`disabled`）に加えて、所属する`organizations.status`も確認する。組織が`suspended`の場合は、ユーザー自身の`status`が`active`であってもログイン不可（`401`）として扱う。

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
