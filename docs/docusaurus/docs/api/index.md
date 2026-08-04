---
sidebar_position: 0
title: API
---

# API

エンドポイント仕様（リクエスト/レスポンス）は左のサイドメニューを参照してください。

- [状態値（status／mode系）の定義](./status-values.md)：全エンドポイント共通で使う語彙
- [案件](./projects/index.md)：案件の作成・一覧・詳細取得
- [工程](./stages/index.md)：質問回答・プロンプト生成・AI実行・成果物編集・品質ゲート
- [管理者：テンプレート](./admin-templates/index.md)：質問セット・プロンプトテンプレート・品質ゲート項目の一覧取得・編集・バージョン差分確認・公開／非公開の切り替え
- [公開テンプレート](./published-templates/index.md)：公開テンプレートの一覧・詳細取得（全ロール閲覧可）
- [管理者：ユーザー](./admin-users/index.md)：メンバー招待・ロール変更・無効化
- [システム管理者：会社](./system-companies/index.md)：会社（組織）の作成・編集・無効化

## 認証

全エンドポイント共通で、Identity PlatformのIDトークンから発行したセッションCookieを`Authorization: Bearer <token>`として受け取り、サーバー側で検証する（`getCurrentUser()`、`CLAUDE.md`「認証（セッションCookie）」参照）。エラー時は`401 Unauthorized`。

- `user`が取得できない場合：`401`
- `organization_id`が一致しない場合：`403`
- 所属する組織の`organizations.status`が`suspended`の場合：`401`（`users.status`が`active`であっても不可。詳細は[状態値の定義](./status-values.md)）
- 管理者用ルートで`role`が`admin`でも`system_admin`でもない場合：`403`
- システム管理者用ルート（会社管理）で`role !== 'system_admin'`の場合：`403`

上記は全エンドポイント共通の挙動のため、個別のエンドポイントページでは`401`／`403`は原則として再掲しない（そのエンドポイント固有のエラーのみ記載する）。

## エラーレスポンス形式

エラー時は、ステータスコードによらず共通で以下の形式のJSONを返す（`src/utils/handleServiceError.ts`・各`route.ts`参照）。

```json
{ "detail": "エラーメッセージ" }
```

`detail`はユーザー向けの日本語メッセージ（`src/constants/messages.ts`由来）。フロントエンドの`fetchData`（`src/lib/frontend/apiClient/FetchData.ts`）はこの`detail`を読み取り、存在すればそのままトースト表示し、無ければステータスコードに応じた既定文言にフォールバックする。

## 一覧取得系（GET）のエラーなしポリシー

一覧取得系のエンドポイント（`GET /api/projects`・`GET /api/admin/templates`・`GET /api/admin/users`・`GET /api/templates/published`・`GET /api/system/companies`・`GET /api/admin/templates/:templateId/projects`）は、対象が0件でもエラーにはせず、`200`で空配列（例：`{ "projects": [] }`）を返す。「存在しないので`404`」にはならない点に注意（`404`が使われるのは、IDを1件指定する詳細取得系のみ）。

## リクエストボディのバリデーションについて

`CLAUDE.md`の設計方針上、フォームとAPIリクエストボディの両方でzodスキーマによる検証（不正時は`422 Unprocessable Entity`）を行う想定だが、2026-08時点で実際にサーバー側バリデーションが実装されているのは[`POST /api/system/companies`](./system-companies/create-company.md)のみ。それ以外のPOST/PUT/PATCHエンドポイント（案件作成・テンプレート作成/更新・メンバー招待/更新等）は、対応するzodスキーマ（例：`createProjectSchema`）自体が未作成で、リクエストボディはJSONとして受け取った値をそのまま使用する（空文字や規定文字数超えの値を送っても`422`にはならず、そのまま保存される）。該当エンドポイントのページにその旨を明記している。
