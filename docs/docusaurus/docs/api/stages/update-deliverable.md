---
sidebar_position: 5
sidebar_label: PATCH /deliverable
title: "PATCH /api/projects/{id}/stages/{stageKey}/deliverable"
---

# `PATCH /api/projects/{id}/stages/{stageKey}/deliverable`

<ApiEndpoint method="PATCH" path="/api/projects/{id}/stages/{stageKey}/deliverable" />

`execution_mode: prompt_only`で外部生成した内容を貼り付ける場合、および既存成果物を編集する場合の両方で使用する。保存のたびに新しい`version`の行が追記され、`generationMethod`は常に`manual`として記録される。`project_stages.status`が`not_started`または`in_progress`だった場合は`quality_gate_pending`に進む（それ以外のステータスの場合は変化しない）。

## Request

```json
{ "content": "貼り付け・編集後の内容" }
```

`content`は`deliverableContentFormSchema`（`src/schemas/deliverableContentFormSchema.ts`）で検証する（トリム後1文字以上必須。フォーム側と共通のスキーマ）。

## Response 200

```json
{ "deliverableId": "uuid", "version": 2, "generationMethod": "manual" }
```

## エラー

- `404`：案件・工程が存在しない（他組織の案件を含む）
- `422`：`content`が空文字（トリム後）の場合

## 競合について（楽観ロックなし）

本APIに`409 Conflict`は存在しない。保存のたびに現在の`deliverable.version`+1を新バージョンとして無条件に追記するだけで、自分が編集を開始した時点のバージョンと現在の最新バージョンが一致するかは検証しない。そのため、2つのタブで同じ成果物を開いて両方保存すると、後から保存した内容が最新版として残り、先に保存した内容は履歴上の古いバージョンになる（last-write-wins。[`PUT /api/admin/templates/:templateId/stages/:stageKey`](../admin-templates/put-template.md)と同様の設計）。
