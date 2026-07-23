---
sidebar_position: 2
sidebar_label: POST /answers
title: "POST /api/projects/{id}/stages/{stageKey}/answers"
---

# `POST /api/projects/{id}/stages/{stageKey}/answers`

<ApiEndpoint method="POST" path="/api/projects/{id}/stages/{stageKey}/answers" />

## Request

```json
{ "answers": { "q1": "回答内容...", "q2": "回答内容..." } }
```

## Response 200

```json
{ "projectStageId": "uuid", "status": "in_progress" }
```

## エラー

- `404`：案件／工程が存在しない
- `403`：他組織の案件
