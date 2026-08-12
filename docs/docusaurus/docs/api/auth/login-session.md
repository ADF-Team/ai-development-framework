---
sidebar_position: 1
sidebar_label: POST /session
title: "POST /api/auth/session"
---

# `POST /api/auth/session`

<ApiEndpoint method="POST" path="/api/auth/session" />

Identity Platformのクライアント側SDKで取得したIDトークンを検証し、セッションCookie（httpOnly）を発行する（ログイン）。

## Request

```json
{ "idToken": "..." }
```

## Response 204

ボディなし。`Set-Cookie`でセッションCookie（`session`、httpOnly、`SameSite=Lax`、有効期限14日）を返す。本番環境（`NODE_ENV=production`）では`Secure`属性も付与される。

## エラー

- `422`：`idToken`が指定されていない場合（`detail`: `IDトークンが指定されていません。`）
- `401`：`idToken`の検証（Firebase Admin SDKの`verifyIdToken`）に失敗した場合（`detail`: `認証情報が無効です。`）
- `403`：IDトークンは有効だが、対応する`users`レコードが存在しない、または`status`が`disabled`の場合（`detail`: `このアカウントは利用できません。`）

このエンドポイントはzodスキーマによるバリデーションを行わず、`idToken`の有無のみを手動でチェックする（[リクエストボディのバリデーションについて](../index.md#リクエストボディのバリデーションについて)参照）。また、所属組織（`organizations.status`）が`suspended`かどうかのチェックは2026-08時点で未実装（`users.status`のみ判定する）。

[ログイン画面](../../screens/login.md)の`LoginForm`から、`src/features/auth/utils/authClient.ts`の`signIn()`経由で呼ばれる（Identity Platform SDKでのログイン成功直後）。`src/lib/frontend/apiClient`のServer Action経由ではなく、クライアントコンポーネントから直接`fetch`する（Identity Platformクライアント側SDKで取得した`idToken`をそのまま送る必要があるための例外）。セッションCookie発行に失敗した場合はFirebase側の認証状態も`signOut()`で破棄する。
