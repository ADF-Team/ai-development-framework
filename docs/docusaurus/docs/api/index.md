---
sidebar_position: 0
title: API
---

# API

エンドポイント仕様（リクエスト/レスポンス）は左のサイドメニューを参照してください。

- [状態値（status／mode系）の定義](./status-values.md)：全エンドポイント共通で使う語彙
- [認証](./auth/index.md)：セッションCookieの発行（ログイン）・削除（ログアウト）
- [案件](./projects/index.md)：案件の作成・一覧・詳細取得
- [工程](./stages/index.md)：質問回答・プロンプト生成・AI実行・成果物編集・品質ゲート
- [管理者：テンプレート](./admin-templates/index.md)：質問セット・プロンプトテンプレート・品質ゲート項目の一覧取得・編集・バージョン差分確認・公開／非公開の切り替え
- [公開テンプレート](./published-templates/index.md)：公開テンプレートの一覧・詳細取得（全ロール閲覧可）
- [管理者：ユーザー](./admin-users/index.md)：メンバー招待・ロール変更・無効化
- [システム管理者：会社](./system-companies/index.md)：会社（組織）の作成・編集・無効化

## 認証

セッションCookieの発行・削除自体を行う[`POST`／`DELETE /api/auth/session`](./auth/index.md)を除く全エンドポイントは、Identity PlatformのIDトークンから発行したセッションCookieを`Authorization: Bearer <token>`として受け取り、サーバー側で検証する想定（`getCurrentUser()`、`CLAUDE.md`「認証（セッションCookie）」参照）。設計上の想定挙動は以下の通り。

- `user`が取得できない場合：`401`
- `organization_id`が一致しない場合：`403`
- 所属する組織の`organizations.status`が`suspended`の場合：`401`（`users.status`が`active`であっても不可。詳細は[状態値の定義](./status-values.md)）
- 管理者用ルートで`role`が`admin`でも`system_admin`でもない場合：`403`
- システム管理者用ルート（会社管理）で`role !== 'system_admin'`の場合：`403`

**2026-08時点で実際に認証チェックが実装されているのは[システム管理者：会社](./system-companies/index.md)（`requireSystemAdmin()`）、[管理者：ユーザー](./admin-users/index.md)（`requireAdmin()`）、[管理者：テンプレート](./admin-templates/index.md)（`requireAdmin()`）、[公開テンプレート](./published-templates/index.md)（`requireUser()`）、[案件](./projects/index.md)（`requireUser()`）配下のエンドポイントのみ**（いずれも内部で`getCurrentUser()`を呼ぶ）。この実装済みの範囲では、上記のうち成立するのは以下。

- `user`が取得できない場合：`401`（全て）
- 管理者用ロールチェックによる`403`：[管理者：ユーザー](./admin-users/index.md)・[管理者：テンプレート](./admin-templates/index.md)は`role`が`admin`でも`system_admin`でもない場合、[システム管理者：会社](./system-companies/index.md)は`role !== 'system_admin'`の場合。[公開テンプレート](./published-templates/index.md)・[案件](./projects/index.md)はロール不問（ログイン済みなら誰でも利用可）なので`403`は発生しない
- `organization_id`のスコープ：[管理者：ユーザー](./admin-users/index.md)・[管理者：テンプレート](./admin-templates/index.md)・[公開テンプレート](./published-templates/index.md)・[案件](./projects/index.md)はアクセス者自身の`organization_id`に常に絞り込む（一覧・作成は自組織内のみ、更新・詳細取得は他組織のIDを指定すると`403`ではなく`404`を返す。存在有無を漏らさないため）

以下は、実装済みの範囲でも未対応（[システム管理者：会社](./system-companies/index.md)は会社管理という性質上、組織横断で動くため）。

- 所属組織`suspended`時の`401`（`getCurrentUser()`が組織の状態を見ていないため）

[工程](./stages/index.md)配下の各`route.ts`は、2026-08時点では`getCurrentUser()`自体を呼んでおらず（ソースコード中に`TODO: インフラ（Cloud SQL）準備後、getCurrentUserによる認証チェックを追加する`という共通コメントがある）、認証なしでアクセスできてしまう状態にある。各エンドポイントページの実装状況の注記もあわせて参照。

上記の設計上の想定挙動は全エンドポイント共通のため、個別のエンドポイントページでは`401`／`403`は原則として再掲しない（そのエンドポイント固有のエラーのみ記載する）。

## エラーレスポンス形式

エラー時は、ステータスコードによらず共通で以下の形式のJSONを返す（`src/utils/handleServiceError.ts`・各`route.ts`参照）。

```json
{ "detail": "エラーメッセージ" }
```

`detail`はユーザー向けの日本語メッセージ（`src/constants/messages.ts`由来）。フロントエンドの`fetchData`（`src/lib/frontend/apiClient/FetchData.ts`）はこの`detail`を読み取り、存在すればそのままトースト表示し、無ければステータスコードに応じた既定文言にフォールバックする。

## 一覧取得系（GET）のエラーなしポリシー

一覧取得系のエンドポイント（`GET /api/projects`・`GET /api/admin/templates`・`GET /api/admin/users`・`GET /api/templates/published`・`GET /api/system/companies`・`GET /api/admin/templates/:templateId/projects`）は、対象が0件でもエラーにはせず、`200`で空配列（例：`{ "projects": [] }`）を返す。「存在しないので`404`」にはならない点に注意（`404`が使われるのは、IDを1件指定する詳細取得系のみ）。

## リクエストボディのバリデーションについて

`CLAUDE.md`の設計方針上、フォームとAPIリクエストボディの両方でzodスキーマによる検証（不正時は`422 Unprocessable Entity`）を行う想定だが、2026-08時点で実際にサーバー側バリデーションが実装されているのは以下の7エンドポイントのみ。

- [`POST /api/system/companies`](./system-companies/create-company.md)（`createCompanySchema`）
- [`PATCH /api/system/companies/:id`](./system-companies/update-company.md)（`updateCompanySchema`）
- [`POST /api/admin/users`](./admin-users/invite-user.md)（`inviteUserSchema`）
- [`PATCH /api/admin/users/:id`](./admin-users/update-user.md)（`updateUserSchema`）
- [`POST /api/admin/templates`](./admin-templates/create-template.md)（`newTemplateSchema`）
- [`PUT /api/admin/templates/:templateId/stages/:stageKey`](./admin-templates/put-template.md)（`stageTemplateSchema`）
- [`POST /api/projects`](./projects/create-project.md)（`createProjectSchema`）

それ以外のPOST/PUT/PATCHエンドポイント（[工程](./stages/index.md)配下の回答保存・成果物編集等）は、対応するzodスキーマ自体が未作成で、リクエストボディはJSONとして受け取った値をそのまま使用する（空文字や規定文字数超えの値を送っても`422`にはならず、そのまま保存される）。該当エンドポイントのページにその旨を明記している。
