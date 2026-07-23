---
sidebar_position: 4
sidebar_label: POST /execute
title: "POST /api/projects/{id}/stages/{stageKey}/execute"
---

# `POST /api/projects/{id}/stages/{stageKey}/execute`

<ApiEndpoint method="POST" path="/api/projects/{id}/stages/{stageKey}/execute" />

アプリ内でAI実行する場合のみ呼び出す（`execution_mode: ai_executed`を選んだ場合の専用エンドポイント。リクエストボディなし）。

## Response 200

```json
{
  "deliverableId": "uuid",
  "version": 1,
  "content": "...",
  "generationMethod": "ai_executed",
  "tokensUsed": { "input": 1200, "output": 800 }
}
```

## エラー

- `502`：Anthropic API呼び出し失敗
- `429`：レート制限

## ロジック概要（アプリ内実行時）

1. `generated_prompt`を取得
2. Anthropic APIを呼び出し（シンプルな1ターン呼び出しを想定。ツール利用なし）
3. レスポンス内容を`deliverables`に新バージョンとして保存（`generation_method: ai_executed`）
4. トークン使用量を[`api_usage_logs`](../../db/tables.md#api_usage_logs)に記録
