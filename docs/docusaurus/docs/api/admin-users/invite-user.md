---
sidebar_position: 2
sidebar_label: POST /users
title: "POST /api/admin/users"
---

# `POST /api/admin/users`

<ApiEndpoint method="POST" path="/api/admin/users" />

組織内メンバーを招待する。Identity Platform側にユーザーを作成し、招待メール（パスワード設定リンク付き）を送信する。

## Request

```json
{ "email": "new@example.com", "role": "user", "displayName": "新しいメンバー" }
```

## Response 201

```json
{ "id": "uuid", "email": "new@example.com", "role": "user", "status": "active" }
```

## エラー

- `409`：同一メールアドレスが既に存在
