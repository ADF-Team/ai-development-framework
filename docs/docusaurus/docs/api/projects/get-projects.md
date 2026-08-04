---
sidebar_position: 1
sidebar_label: GET /projects
title: "GET /api/projects"
---

# `GET /api/projects`

<ApiEndpoint method="GET" path="/api/projects" />

案件一覧を、各案件の7工程分のステータスサマリー付きで返す（一覧画面の進捗バー表示に必要なため、工程別詳細は含めずステータスのみ返す）。

## Response 200

```json
{
  "projects": [
    {
      "id": "uuid",
      "name": "案件A",
      "overallStatus": "in_progress",
      "currentStage": "design",
      "stageStatuses": {
        "requirements": "completed",
        "design": "in_progress",
        "implementation": "not_started",
        "review": "not_started",
        "security": "not_started",
        "test": "not_started",
        "documentation": "not_started"
      },
      "createdAt": "2026-07-01T00:00:00Z"
    }
  ]
}
```

組織内に案件が1件もない場合も`404`にはならず、`projects: []`（空配列）を返す（[一覧取得系のエラーなしポリシー](../index.md#一覧取得系getのエラーなしポリシー)参照）。
