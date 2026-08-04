---
sidebar_position: 3
sidebar_label: POST /generate-prompt
title: "POST /api/projects/{id}/stages/{stageKey}/generate-prompt"
---

# `POST /api/projects/{id}/stages/{stageKey}/generate-prompt`

<ApiEndpoint method="POST" path="/api/projects/{id}/stages/{stageKey}/generate-prompt" />

Request: なし（保存済みanswersを使用）

## Response 200

```json
{ "generatedPrompt": "..." }
```

## エラー

- `404`：案件／工程が存在しない
- `403`：他組織の案件
- `409`：質問への回答が1件も保存されていない場合（`answers`の全項目が空文字、または一度も[`POST /answers`](./save-answers.md)が呼ばれていない場合。個々の質問に「必須」フラグはなく、あくまで「何かしら回答済みか」のみを見る点に注意）

## ロジック概要

1. `project_stages.answers`（JSONB）を取得
2. `project.template_id`から`template_versions`の最新`version`を取得し、その`id`＋`stage_key`に紐づく`prompt_templates`を取得
3. テンプレート内のプレースホルダー（`{{answer:質問ID}}`形式）を回答内容で置換
4. 置換後のテキストを`generated_prompt`として`project_stages`に保存し返却（版管理はせず上書き）
