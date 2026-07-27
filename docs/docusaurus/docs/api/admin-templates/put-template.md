---
sidebar_position: 4
sidebar_label: PUT /templates/{templateId}/stages/{stageKey}
title: "PUT /api/admin/templates/{templateId}/stages/{stageKey}"
---

# `PUT /api/admin/templates/{templateId}/stages/{stageKey}`

<ApiEndpoint method="PUT" path="/api/admin/templates/{templateId}/stages/{stageKey}" />

管理者ロールのみアクセス可（`403`：一般利用者がアクセスした場合）。テンプレート全体（テンプレート名＋指定工程の内容）を新バージョンとして追記する形で保存する（編集していない他の6工程の内容は、直前バージョンからそのまま引き継がれる）。

[テンプレート詳細画面](../../screens/template-detail.md)では、テンプレート名・質問セット・プロンプトテンプレート・品質ゲート項目への変更は即座に保存されず、画面見出し右側の保存ボタンを押した時点でまとめて本APIが呼ばれる。

## Request

[GET](./get-template.md)と同じ形式のボディを送信（`version`・`versions`は不要。サーバー側で自動採番）。`title`は1〜255文字（`createTemplateSchema`と同じルールでバリデーションする）。

## Response 200

```json
{ "version": 4 }
```
