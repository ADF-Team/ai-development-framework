---
sidebar_position: 4
sidebar_label: PUT /templates/{templateId}/stages/{stageKey}
title: "PUT /api/admin/templates/{templateId}/stages/{stageKey}"
---

# `PUT /api/admin/templates/{templateId}/stages/{stageKey}`

<ApiEndpoint method="PUT" path="/api/admin/templates/{templateId}/stages/{stageKey}" />

`admin`／`system_admin`ロールのみアクセス可（`403`：`user`ロールがアクセスした場合）。テンプレート全体（テンプレート名＋指定工程の内容）を新バージョンとして追記する形で保存する（編集していない他の6工程の内容は、直前バージョンからそのまま引き継がれる）。

[テンプレート詳細画面](../../screens/template-detail.md)では、テンプレート名・質問セット・プロンプトテンプレート・品質ゲート項目への変更は即座に保存されず、画面見出し右側の保存ボタンを押した時点でまとめて本APIが呼ばれる。

## Request

[GET](./get-template.md)と同じ形式のボディを送信（`version`・`versions`は不要。サーバー側で自動採番）。

## Response 200

```json
{ "version": 4 }
```

## エラー

- `422`：リクエストボディが`stageTemplateSchema`（`src/schemas/stageTemplateSchema.ts`。フォーム入力・リクエストボディ共通）のバリデーションに違反する場合（`title`が空文字／256文字以上、`questions`が0件、`promptTemplate`が空文字、`qualityGateItems`が0件）。`detail`には最初に検知したバリデーションエラーのメッセージが入る
- `404`：`templateId`が存在しない（他組織のテンプレートを含む）、または`stageKey`が7工程マスタのいずれにも一致しない場合

## 競合について（楽観ロックなし）

本APIに`409 Conflict`は存在しない。2人の管理者が同じテンプレートを同時に開いて保存した場合でも、それぞれの保存は「直前バージョンに新しいバージョンを追記する」処理として独立に成功する（`updateStageTemplate`は保存時点の`versions`配列の最大値+1を次バージョン番号として採番するだけで、自分が読み込んだ時点のバージョン番号と現在の最新バージョンが一致するかは検証しない）。そのため、後から保存した方が事実上のlast-write-winsとなり、先に保存した内容は新しいバージョンとして履歴には残るものの「現在有効な版」ではなくなる（画面上で見えなくなる）。バージョン間の上書きに気づきたい場合は、[バージョン履歴](./get-template-version.md)から差分を確認する。
