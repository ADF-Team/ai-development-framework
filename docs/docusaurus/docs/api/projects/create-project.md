---
sidebar_position: 2
sidebar_label: POST /projects
title: "POST /api/projects"
---

# `POST /api/projects`

<ApiEndpoint method="POST" path="/api/projects" />

## Request

```json
{ "name": "案件A" }
```

## Response 201

```json
{
  "id": "uuid",
  "name": "案件A",
  "currentStage": "requirements",
  "overallStatus": "in_progress"
}
```

作成時、サーバー側で7工程分の`project_stages`レコードを`status: not_started`で一括作成する（詳細は「案件作成時の初期化ロジック」`docs/README.md` C4参照）。
