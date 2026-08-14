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

- `404`：案件・工程が存在しない（他組織の案件を含む）
- `409`：質問への回答が1件も保存されていない場合（`answers`の全項目が空文字、または一度も[`POST /answers`](./save-answers.md)が呼ばれていない場合。個々の質問に「必須」フラグはなく、あくまで「何かしら回答済みか」のみを見る点に注意）

## ロジック概要

1. `project_stages.answers`（JSONB）を取得し、非空の値が1件もなければ`409`
2. `project.template_id`から`template_versions`の最新`version`を取得し、その`id`＋`stage_key`に紐づく`question_templates`（質問セット）を取得
3. 固定フォーマットでプロンプト文を組み立てる（[管理者：テンプレート](../admin-templates/index.md)で編集する`prompt_templates`のテキストは使用しない。プレースホルダー置換は行っていない）：
   - 冒頭行：「あなたは{工程名}を担当する専門家です。以下のヒアリング回答をもとに、{工程名}工程の成果物を作成してください。」
   - 回答済みの質問ごとに「{No}. {質問文}」「→ {回答内容}」の2行（未回答の質問はスキップする）
   - 末尾行：「上記を踏まえ、実務で使えるレベルの成果物をMarkdown形式で出力してください。」
4. 組み立てたテキストを`generated_prompt`として`project_stages`に保存し返却（版管理はせず上書き）
