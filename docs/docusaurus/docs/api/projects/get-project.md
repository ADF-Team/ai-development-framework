---
sidebar_position: 3
sidebar_label: GET /projects/{id}
title: "GET /api/projects/{id}"
---

# `GET /api/projects/{id}`

<ApiEndpoint method="GET" path="/api/projects/{id}" />

## Response 200

```json
{
  "id": "uuid",
  "name": "案件A",
  "overallStatus": "in_progress",
  "currentStage": "design",
  "stages": [
    { "stageKey": "requirements", "status": "completed" },
    { "stageKey": "design", "status": "in_progress" }
  ]
}
```

## エラー

- `404`：`id`に一致する案件が存在しない場合（他組織の案件を含む。存在有無を漏らさないため、他組織の案件でも`403`ではなく`404`を返す）
