---
sidebar_position: 1
sidebar_label: GET /companies
title: "GET /api/system/companies"
---

# `GET /api/system/companies`

<ApiEndpoint method="GET" path="/api/system/companies" />

システム管理者ロールのみアクセス可。

## Response 200

```json
{
  "companies": [
    { "id": "uuid", "name": "株式会社サンプル", "status": "active", "createdAt": "2026-07-01T00:00:00Z" }
  ]
}
```

[会社管理画面](../../screens/company-management.md)の`CompanyCard`一覧表示に使う。
