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
