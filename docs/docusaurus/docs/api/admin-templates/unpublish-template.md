---
sidebar_position: 9
sidebar_label: POST /templates/{templateId}/unpublish
title: "POST /api/admin/templates/{templateId}/unpublish"
---

# `POST /api/admin/templates/{templateId}/unpublish`

<ApiEndpoint method="POST" path="/api/admin/templates/{templateId}/unpublish" />

`admin`／`system_admin`ロールのみアクセス可。テンプレートを非公開状態に戻す（`templates.published_at`を`null`に更新）。既に非公開の場合も同様に冪等とする。

既にこのテンプレートを複製して作られた他のテンプレート（`source_published_template_id`が本テンプレートを指すもの）には影響しない。

## Response 200

```json
{ "id": "uuid", "publishedAt": null }
```

## エラー

- `404`：`templateId`が存在しない場合（他組織のテンプレートを含む）

[マイテンプレート一覧画面](../../screens/my-templates.md)の`TemplateCard`にある「公開を取り下げる」ボタンから呼ばれる。
