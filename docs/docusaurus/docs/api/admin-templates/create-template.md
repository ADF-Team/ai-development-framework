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

`title`は1〜255文字（`template_versions.title`のVARCHAR(255)に合わせる）。フォーム入力・リクエストボディ共通の`createTemplateSchema`（`src/schemas/`。`CLAUDE.md`「フォームバリデーション（zod）」参照）でバリデーションする。

作成後、[マイテンプレート一覧画面](../../screens/my-templates.md)の`NewTemplateModal`はこのテンプレートの[テンプレート詳細画面](../../screens/template-detail.md)（工程1）へ遷移する。
