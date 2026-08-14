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

- `404`：案件／工程が存在しない
- `403`：他組織の案件
- `409`：`generated_prompt`が未生成の場合（先に[`POST /generate-prompt`](./generate-prompt.md)を呼ぶ必要がある）
- `502`：Anthropic API呼び出し失敗
- `429`：レート制限

`502`／`429`は、Anthropic API連携が実装された後に発生しうるエラー（設計上の想定）。2026-08時点の実装（`executeStage`）はAnthropic APIを呼ばず、保存済みの回答内容から成果物を組み立てるモックのため、実際にはこの2つは発生しない（`tokensUsed`もダミー値`{ input: 1200, output: 800 }`を固定で返す）。

[工程](./index.md)配下の他5エンドポイントとは異なり、本エンドポイントのみ`src/lib/services/projects.ts`のプロセス内メモリストア（`getCurrentUser`による認証チェック・組織スコープも未実装）を参照し続けている。そのため、実際にPrisma（実DB）で作成した案件IDを渡すと、モックストア側にそのIDが存在せず**常に`404`になる**（メモリストアのシードデータ`p1`〜`p4`を指定した場合のみ動作する）。「プロンプトのみ」実行モード（[`PATCH /deliverable`](./update-deliverable.md)への貼り付け保存）は実DBの案件で問題なく利用できる。

## ロジック概要（アプリ内実行時・Anthropic API連携後の設計）

1. `generated_prompt`を取得
2. Anthropic APIを呼び出し（シンプルな1ターン呼び出しを想定。ツール利用なし）
3. レスポンス内容を`deliverables`に新バージョンとして保存（`generation_method: ai_executed`）
4. トークン使用量を[`api_usage_logs`](../../db/tables.md#api_usage_logs)に記録
