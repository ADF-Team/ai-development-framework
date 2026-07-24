---
sidebar_position: 6
sidebar_label: GET /templates/{templateId}/projects
title: "GET /api/admin/templates/{templateId}/projects"
---

# `GET /api/admin/templates/{templateId}/projects`

<ApiEndpoint method="GET" path="/api/admin/templates/{templateId}/projects" />

管理者ロールのみアクセス可。[テンプレート詳細画面](../../screens/template-detail.md)で保存ボタンを押した際、このテンプレートを参照している**進行中**（`overall_status: in_progress`）の案件一覧を取得し、影響確認モーダル（`SaveImpactModal`）の表示要否・内容を判定するために使う（完了済み案件は対象外）。

## Response 200

```json
{
  "projects": [
    { "id": "uuid", "name": "ECサイトリニューアル" }
  ]
}
```

`projects`が1件以上ある場合、クライアント側で`SaveImpactModal`を表示し、管理者が続行を確認してから[`PUT /api/admin/templates/:templateId/stages/:stageKey`](./put-template.md)を呼ぶ。0件の場合は確認なしでそのまま保存する。
