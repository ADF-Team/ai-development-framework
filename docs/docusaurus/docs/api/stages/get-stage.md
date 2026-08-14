---
sidebar_position: 1
sidebar_label: GET /stages/{stageKey}
title: "GET /api/projects/{id}/stages/{stageKey}"
---

# `GET /api/projects/{id}/stages/{stageKey}`

<ApiEndpoint method="GET" path="/api/projects/{id}/stages/{stageKey}" />

`questions`／`qualityGateItems`は、案件が参照する[テンプレート](../admin-templates/index.md)の現在有効な版から取得する（テンプレート編集は既存案件にも反映されるライブ参照。[案件作成API](../projects/create-project.md)と同じ設計）。

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

- `404`：案件が存在しない（他組織の案件を含む）、または`stageKey`が7工程マスタのいずれにも一致しない場合
