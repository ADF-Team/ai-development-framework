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

- `409`：未回答の必須質問がある場合

## ロジック概要

1. `project_stages.answers`（JSONB）を取得
2. 該当`organization_id`＋`stage_key`の`prompt_templates`のうち最新`version`を取得
3. テンプレート内のプレースホルダー（`{{answer:質問ID}}`形式）を回答内容で置換
4. 置換後のテキストを`generated_prompt`として`project_stages`に保存し返却（版管理はせず上書き）
