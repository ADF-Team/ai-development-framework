---
sidebar_position: 1
sidebar_label: GET /stages/{stageKey}
title: "GET /api/projects/{id}/stages/{stageKey}"
---

# `GET /api/projects/{id}/stages/{stageKey}`

<ApiEndpoint method="GET" path="/api/projects/{id}/stages/{stageKey}" />

## Response 200

```json
{
  "stageKey": "design",
  "status": "in_progress",
  "questions": [{ "id": "q1", "text": "...", "order": 1 }],
  "answers": { "q1": "回答内容" },
  "generatedPrompt": "...",
  "deliverable": {
    "id": "uuid",
    "version": 2,
    "content": "...",
    "generationMethod": "manual"
  },
  "qualityGateItems": [{ "id": "item1", "label": "...", "order": 1 }],
  "qualityGateResult": { "item1": { "checked": true } }
}
```

## エラー

- `404`：存在しない
- `403`：他組織の案件
