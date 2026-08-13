---
sidebar_position: 2
sidebar_label: POST /users
title: "POST /api/admin/users"
---

# `POST /api/admin/users`

<ApiEndpoint method="POST" path="/api/admin/users" />

アクセス者自身の組織（`organization_id`）にメンバーを招待する。`role`には`user`／`admin`のみ指定可（`system_admin`は招待できない。招待自体は[システム管理者：会社](../system-companies/index.md)の会社作成時のみ発生する上位ロールのため）。

## Request

```json
{ "email": "new@example.com", "role": "user", "displayName": "新しいメンバー" }
```

## Response 201

```json
{ "id": "uuid", "email": "new@example.com", "role": "user", "status": "active", "displayName": "新しいメンバー" }
```

## エラー

- `422`：リクエストボディが`inviteUserSchema`のバリデーションに違反する場合（`email`がメール形式でない／256文字以上、`displayName`が空文字／101文字以上、`role`が`user`／`admin`以外）。`detail`には最初に検知したバリデーションエラーのメッセージ（`src/constants/messages.ts`の`adminUsers.validation.*`）が入る
- `409`：同一メールアドレスが既に存在する場合（`users.email`はユニーク制約かつ組織をまたいで一意。Prismaの一意制約違反（P2002）を[`ServiceError`](../system-companies/create-company.md)経由で変換する）

`displayName`の最大長は`users.display_name`のDB列（`VARCHAR(100)`）に合わせて100文字。[会社作成API](../system-companies/create-company.md)と同様、Identity Platform側のユーザー作成・招待メール送信自体は2026-08時点では未実装で、作成される`users`レコードの`identityPlatformUid`には`pending:<uuid>`というプレースホルダ値が入る（そのため、作成された時点ではまだ実際にログインできない）。
