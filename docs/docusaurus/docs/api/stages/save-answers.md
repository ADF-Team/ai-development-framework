---
sidebar_position: 2
sidebar_label: POST /answers
title: "POST /api/projects/{id}/stages/{stageKey}/answers"
---

# `POST /api/projects/{id}/stages/{stageKey}/answers`

<ApiEndpoint method="POST" path="/api/projects/{id}/stages/{stageKey}/answers" />

既存の`answers`（質問ID→回答のマップ）へマージ保存する（丸ごと置き換えではない。未回答のまま残したい質問はリクエストに含めなくてよい）。空文字を含む全項目が空でも`422`にはならない（保存を許可する。「未回答」の判定は[`POST /generate-prompt`](./generate-prompt.md)側で行う）。

## Request

```json
{ "answers": { "q1": "回答内容...", "q2": "回答内容..." } }
```

`answers`は`postStageAnswersSchema`（`src/schemas/api/postStageAnswersSchema.ts`）で検証する（`{ 質問ID: 文字列 }`の形式であること。非空チェックは行わない。フロントエンドの回答フォーム用の`stageAnswersFormSchema`（`src/schemas/frontend/`。1件以上の非空回答を要求）とは別のスキーマである点に注意。「回答を保存」ボタンは空欄のままでも保存できる仕様のため）。

## Response 200

```json
{ "projectStageId": "uuid", "status": "in_progress" }
```

`status`は、保存前が`not_started`かつマージ後の`answers`に非空の値が1件以上あれば`in_progress`に進む。それ以外は変化しない（`in_progress`・`quality_gate_pending`・`completed`のいずれかで呼んだ場合、`status`は保存前と同じ値のまま返る）。

## エラー

- `404`：案件・工程が存在しない（他組織の案件を含む）
- `422`：`answers`が`{ 質問ID: 文字列 }`の形式でない場合
