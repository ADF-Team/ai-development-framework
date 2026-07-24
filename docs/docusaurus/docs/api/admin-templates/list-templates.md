---
sidebar_position: 1
sidebar_label: GET /templates
title: "GET /api/admin/templates"
---

# `GET /api/admin/templates`

<ApiEndpoint method="GET" path="/api/admin/templates" />

管理者ロールのみアクセス可（`403`：一般利用者がアクセスした場合）。[マイテンプレート一覧画面](../../screens/my-templates.md)用に、テンプレート概要（現在有効な版の情報のみ）をまとめて返す。

## Response 200

```json
{
  "templates": [
    {
      "id": "uuid",
      "title": "標準テンプレート",
      "version": 3,
      "updatedAt": "2026-07-10",
      "updatedBy": "山田"
    }
  ]
}
```

各項目の内容は[`GET /api/admin/templates/:templateId/stages/:stageKey`](./get-template.md)の現在有効な版から算出したサマリー。
