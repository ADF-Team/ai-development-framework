---
sidebar_position: 2
sidebar_label: POST /projects
title: "POST /api/projects"
---

# `POST /api/projects`

<ApiEndpoint method="POST" path="/api/projects" />

## Request

```json
{ "name": "案件A", "templateId": "uuid" }
```

## Response 201

```json
{
  "id": "uuid",
  "name": "案件A",
  "overallStatus": "in_progress",
  "currentStage": "requirements",
  "stageStatuses": {
    "requirements": "in_progress",
    "design": "not_started",
    "implementation": "not_started",
    "review": "not_started",
    "security": "not_started",
    "test": "not_started",
    "documentation": "not_started"
  },
  "createdAt": "2026-07-24"
}
```

**エラー**: `404`（存在しない`templateId`を指定した場合）

`name`は1〜255文字（`projects.name`のVARCHAR(255)に合わせる）。フォーム入力・リクエストボディ共通の`createProjectSchema`（`src/schemas/`。`CLAUDE.md`「フォームバリデーション（zod）」参照）でバリデーションする。

作成時、サーバー側で7工程分の`project_stages`レコードを`status: not_started`で一括作成する（工程1のみ`in_progress`）。案件は`templateId`を保持し、以降の質問セット・プロンプトテンプレート・品質ゲート項目は常にこのテンプレートの現在有効な版を参照する（詳細は「案件作成時の初期化ロジック」`docs/README.md` C4参照）。
