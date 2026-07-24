---
sidebar_position: 3
sidebar_label: GET /templates/{templateId}/stages/{stageKey}
title: "GET /api/admin/templates/{templateId}/stages/{stageKey}"
---

# `GET /api/admin/templates/{templateId}/stages/{stageKey}`

<ApiEndpoint method="GET" path="/api/admin/templates/{templateId}/stages/{stageKey}" />

管理者ロールのみアクセス可（`403`：一般利用者がアクセスした場合）。

## Response 200

```json
{
  "templateId": "uuid",
  "stageKey": "design",
  "title": "標準テンプレート",
  "questions": [{ "id": "q1", "text": "...", "order": 1 }],
  "promptTemplate": "...{{answer:q1}}...",
  "qualityGateItems": [{ "id": "item1", "label": "...", "order": 1 }],
  "version": 3,
  "versions": [
    { "version": 3, "createdAt": "2026-07-10", "createdBy": "山田" },
    { "version": 2, "createdAt": "2026-05-02", "createdBy": "田中" },
    { "version": 1, "createdAt": "2026-02-14", "createdBy": "山田" }
  ]
}
```

`title`はテンプレート名（テンプレート詳細画面の見出し・マイテンプレート一覧のカード見出しに使用）。どの工程タブから見ても同じ値（テンプレート単位で1つ）。

`version`／`versions`はテンプレート全体で共有される版番号・履歴（特定の工程だけの版ではない）。`versions`は[`VersionHistoryPanel`](../../screens/template-detail.md)・差分モーダル表示用のバージョン履歴（バージョン番号の降順）。
