---
sidebar_position: 1
sidebar_label: GET /templates/{stageKey}
title: "GET /api/admin/templates/{stageKey}"
---

# `GET /api/admin/templates/{stageKey}`

<ApiEndpoint method="GET" path="/api/admin/templates/{stageKey}" />

管理者ロールのみアクセス可（`403`：一般利用者がアクセスした場合）。

## Response 200

```json
{
  "stageKey": "design",
  "questions": [{ "id": "q1", "text": "...", "order": 1 }],
  "promptTemplate": "...{{answer:q1}}...",
  "qualityGateItems": [{ "id": "item1", "label": "...", "order": 1 }],
  "version": 3
}
```
