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

## エラー

- `404`：存在しない`templateId`を指定した場合（`getStageTemplateContent`が工程1の内容取得を試みて検証する）

`name`は本来1〜255文字（`projects.name`のVARCHAR(255)に合わせる）で、フォーム入力・リクエストボディ共通の`createProjectSchema`（`CLAUDE.md`「フォームバリデーション（zod）」参照）でバリデーションする設計だが、2026-08時点では`src/schemas/createProjectSchema.ts`は未作成で、サーバー側では検証されない（[リクエストボディのバリデーションについて](../index.md#リクエストボディのバリデーションについて)参照）。空文字の`name`を送っても`422`にはならず、そのまま案件が作成される。

作成時、サーバー側で7工程分の`project_stages`レコードを`status: not_started`で一括作成する（工程1のみ`in_progress`）。案件は`templateId`を保持し、以降の質問セット・プロンプトテンプレート・品質ゲート項目は常にこのテンプレートの現在有効な版を参照する（詳細は「案件作成時の初期化ロジック」`docs/README.md` C4参照）。
