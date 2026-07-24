---
sidebar_position: 1
sidebar_label: GET /templates/published
title: "GET /api/templates/published"
---

# `GET /api/templates/published`

<ApiEndpoint method="GET" path="/api/templates/published" />

管理者・利用者ともにアクセス可。公開中（`published_at`が非NULL）のテンプレート一覧を、名称・現在バージョン・公開日時付きで返す。

## Response 200

```json
{
  "templates": [
    { "id": "uuid", "title": "標準テンプレート", "version": 3, "publishedAt": "2026-07-20T00:00:00Z" }
  ]
}
```

[公開テンプレート一覧画面](../../screens/published-templates.md)の`PublishedTemplateCard`一覧表示に使う。
