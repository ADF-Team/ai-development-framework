---
sidebar_position: 2
sidebar_label: POST /templates
title: "POST /api/admin/templates"
---

# `POST /api/admin/templates`

<ApiEndpoint method="POST" path="/api/admin/templates" />

管理者ロールのみアクセス可。新規テンプレートを作成する。7工程とも空の内容（質問セット・プロンプトテンプレート・品質ゲート項目なし）で初期化される。

## Request

```json
{ "title": "Webアプリ案件用テンプレート" }
```

## Response 201

```json
{ "id": "uuid", "version": 1 }
```

## エラー

- `422`：リクエストボディが`newTemplateSchema`（`src/schemas/newTemplateSchema.ts`。フォーム入力・リクエストボディ共通）のバリデーションに違反する場合（`title`が空文字／256文字以上）。`title`は`template_versions.title`のVARCHAR(255)に合わせて1〜255文字。`detail`には最初に検知したバリデーションエラーのメッセージ（`src/constants/messages.ts`の`adminTemplates.validation.*`）が入る
- `409`：同じ組織内に、現在のタイトルが一致するテンプレートが既に存在する場合（`detail`: `この名前のテンプレートは既に存在します。`）。`templates(organization_id, title)`のDB一意制約で保証される（`templates.title`は現在有効な版のタイトルを都度書き込む非正規化カラム。アプリ側の事前チェック（`findTemplateIdByCurrentTitle`）は高速な早期リターンに過ぎず、完全同時作成が発生した場合も最終的にはこのDB制約がPrismaのP2002エラーとして検知する）

作成時、サーバー側で7工程分の`question_templates`／`prompt_templates`／`quality_gate_items`を空の内容（質問セット・品質ゲート項目は空配列、プロンプトテンプレートは冒頭・末尾の定型文のみ）で一括作成する（`version: 1`の`template_versions`に紐づく）。

作成後、[マイテンプレート一覧画面](../../screens/my-templates.md)の`NewTemplateModal`はこのテンプレートの[テンプレート詳細画面](../../screens/template-detail.md)（工程1）へ遷移する。
