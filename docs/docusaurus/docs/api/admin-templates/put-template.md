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
- `409`：以下のいずれか
  - `title`が、同じ組織内の**他の**テンプレート（自分自身は除く）の現在タイトルと重複する場合（`detail`: `この名前のテンプレートは既に存在します。`）。`templates(organization_id, title)`のDB一意制約で保証される
  - ごく稀に、複数の保存リクエストが完全に同時に発生し、採番される次バージョン番号が競合した場合（`(template_id, version)`のDB一意制約による。汎用的な競合メッセージになる。この場合はもう一度保存し直せば成功する）
- `404`：`templateId`が存在しない（他組織のテンプレートを含む）、または`stageKey`が7工程マスタのいずれにも一致しない場合

## 競合について（楽観ロックなし）

「現在有効な版の取得（他の6工程の内容引き継ぎ元）」と「新バージョンの書き込み」は1トランザクション内で行われるため、2人の管理者がほぼ同時に**異なる工程**を保存した場合でも、片方の保存内容が新しいバージョンにサイレントに消し飛ばされることはない（後から確定した保存は、常にその時点で最新の内容をベースに次バージョンを追記する）。

一方で、`自分が読み込んだ時点のバージョン番号と現在の最新バージョンが一致するか`は検証しない（楽観ロックは行われない）。そのため、2人の管理者が**同じ工程**をほぼ同時に編集して保存した場合は、後から保存した方の内容でその工程が上書きされる（last-write-wins）。上書きに気づきたい場合は、[バージョン履歴](./get-template-version.md)から差分を確認する。
