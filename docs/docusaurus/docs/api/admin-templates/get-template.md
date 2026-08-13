---
sidebar_position: 3
sidebar_label: GET /templates/{templateId}/stages/{stageKey}
title: "GET /api/admin/templates/{templateId}/stages/{stageKey}"
---

# `GET /api/admin/templates/{templateId}/stages/{stageKey}`

<ApiEndpoint method="GET" path="/api/admin/templates/{templateId}/stages/{stageKey}" />

`admin`／`system_admin`ロールのみアクセス可（`403`：`user`ロールがアクセスした場合）。アクセス者自身の組織に属するテンプレートのみ取得可能（他組織の`templateId`を指定した場合は、存在しない場合と同じ`404`）。

## Response 200

```json
{
  "templateId": "uuid",
  "stageKey": "design",
  "title": "標準テンプレート",
  "questions": [{ "id": "q1", "text": "...", "order": 1 }],
  "promptTemplate": "...{{answer:q1}}...",
  "qualityGateItems": [{ "id": "item1", "label": "...", "order": 1 }],
  "version": 3,
  "versions": [
    { "version": 3, "createdAt": "2026-07-10", "createdBy": "山田" },
    { "version": 2, "createdAt": "2026-05-02", "createdBy": "田中" },
    { "version": 1, "createdAt": "2026-02-14", "createdBy": "山田" }
  ],
  "isPublished": true
}
```

## エラー

- `404`：`templateId`が存在しない（他組織のテンプレートを含む）、または`stageKey`が7工程マスタのいずれにも一致しない場合（`assertStageKey`）

`title`はテンプレート名（テンプレート詳細画面の見出し・マイテンプレート一覧のカード見出しに使用）。どの工程タブから見ても同じ値（テンプレート単位で1つ）。

`version`／`versions`はテンプレート全体で共有される版番号・履歴（特定の工程だけの版ではない）。`versions`は[`VersionHistoryPanel`](../../screens/template-detail.md)・差分モーダル表示用のバージョン履歴（バージョン番号の降順）。

`isPublished`は[`TemplateSummary`](./list-templates.md)の同名フィールドと同じ意味（`templates.published_at`が非NULLか）。[テンプレート詳細画面](../../screens/template-detail.md)の「このテンプレートで案件を作成する」ボタンは、`isPublished`が`true`の場合のみ表示される（[案件作成API](../projects/create-project.md)がtemplateIdに公開中のテンプレートしか受け付けないため）。
