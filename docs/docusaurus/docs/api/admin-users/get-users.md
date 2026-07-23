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
