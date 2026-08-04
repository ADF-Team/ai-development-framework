---
sidebar_position: 1
sidebar_label: GET /users
title: "GET /api/admin/users"
---

# `GET /api/admin/users`

<ApiEndpoint method="GET" path="/api/admin/users" />

管理者ロールのみアクセス可。

## Response 200

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

組織内にメンバーが1件もない場合も`404`にはならず、`users: []`（空配列）を返す（[一覧取得系のエラーなしポリシー](../index.md#一覧取得系getのエラーなしポリシー)参照）。
