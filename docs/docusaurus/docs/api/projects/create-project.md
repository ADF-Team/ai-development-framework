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

- `422`：リクエストボディが`createProjectSchema`（`src/schemas/createProjectSchema.ts`。フォーム入力・リクエストボディ共通）のバリデーションに違反する場合（`name`が空文字／256文字以上、`templateId`が空文字）。`detail`には最初に検知したバリデーションエラーのメッセージ（`src/constants/messages.ts`の`projects.validation.*`）が入る
- `404`：`templateId`が、アクセス者自身の組織内で**公開中**のテンプレートとして存在しない場合。存在しないID・他組織のテンプレート・**非公開のテンプレート**（管理者がまだ「マイテンプレート」で編集中のもの）のいずれも同じ`404`になる（[管理者：テンプレート](../admin-templates/index.md)配下の管理者専用テンプレートを、権限のない一般利用者が推測して使えてしまわないようにするため）

作成時、サーバー側で7工程分の`project_stages`レコードを`status: not_started`で一括作成する（工程1のみ`in_progress`）。案件は`templateId`を保持し、以降の質問セット・プロンプトテンプレート・品質ゲート項目は常にこのテンプレートの現在有効な版を参照する（詳細は「案件作成時の初期化ロジック」`docs/README.md` C4参照）。

[案件一覧画面](../../screens/project-list.md)の`NewProjectModal`のテンプレート選択肢は、[`GET /api/templates/published`](../published-templates/list-published-templates.md)（全ロールアクセス可）から取得する（[管理者：テンプレート一覧](../admin-templates/list-templates.md)は管理者専用のため使わない）。
