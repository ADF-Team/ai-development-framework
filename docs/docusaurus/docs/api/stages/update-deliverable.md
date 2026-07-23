---
sidebar_position: 5
sidebar_label: PATCH /deliverable
title: "PATCH /api/projects/{id}/stages/{stageKey}/deliverable"
---

# `PATCH /api/projects/{id}/stages/{stageKey}/deliverable`

<ApiEndpoint method="PATCH" path="/api/projects/{id}/stages/{stageKey}/deliverable" />

`execution_mode: prompt_only`で外部生成した内容を貼り付ける場合、および既存成果物を編集する場合の両方で使用する。保存のたびに新しい`version`の行が追記され、`generationMethod`は常に`manual`として記録される。

## Request

```json
{ "content": "貼り付け・編集後の内容" }
```

## Response 200

```json
{ "deliverableId": "uuid", "version": 2, "generationMethod": "manual" }
```
