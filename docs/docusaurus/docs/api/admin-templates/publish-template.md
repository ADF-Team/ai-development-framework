---
sidebar_position: 8
sidebar_label: POST /templates/{templateId}/publish
title: "POST /api/admin/templates/{templateId}/publish"
---

# `POST /api/admin/templates/{templateId}/publish`

<ApiEndpoint method="POST" path="/api/admin/templates/{templateId}/publish" />

管理者ロールのみアクセス可。テンプレートを公開状態にする（`templates.published_at`を現在時刻に更新）。既に公開済みの場合はエラーにせず何もしない（冪等）。

## Response 200

```json
{ "id": "uuid", "publishedAt": "2026-07-24T00:00:00Z" }
```

[マイテンプレート一覧画面](../../screens/my-templates.md)の`TemplateCard`にある「公開する」ボタン（`PublishConfirmModal`で確認後）から呼ばれる。公開すると、[公開テンプレート一覧画面](../../screens/published-templates.md)から全ユーザーが閲覧できるようになる。
