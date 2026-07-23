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

- `404`：存在しない
- `403`：他組織の案件
