---
sidebar_position: 7
sidebar_label: POST /templates/{templateId}/duplicate
title: "POST /api/admin/templates/{templateId}/duplicate"
---

# `POST /api/admin/templates/{templateId}/duplicate`

<ApiEndpoint method="POST" path="/api/admin/templates/{templateId}/duplicate" />

`admin`／`system_admin`ロールのみアクセス可。現在有効な版（7工程分）の内容をコピーした新規テンプレートを作成する。複製先はバージョン1から始まる独立したテンプレートで、複製元のバージョン履歴は引き継がない。既存の案件が参照しているテンプレートには影響しない（案件のテンプレート差し替えは行わない）。

## Response 201

```json
{ "id": "uuid", "version": 1 }
```

## エラー

- `404`：複製元の`templateId`が存在しない場合（他組織のテンプレート・[公開テンプレート](../published-templates/index.md)であってもアクセス者自身の組織に属さないものを含む）
- `409`：複製先の自動生成タイトル（下記）が、同じ組織内の既存テンプレートの現在タイトルと重複する場合（`detail`: `この名前のテンプレートは既に存在します。`）。例えば同じテンプレートを2回連続で複製しようとすると、2回目は「〇〇のコピー」が既に存在するため失敗する（この場合、いずれかを手動でリネームしてから複製し直す必要がある）

複製されたテンプレートの`title`は、複製元のタイトルに「のコピー」を付与した値になる（例：「標準テンプレート」→「標準テンプレートのコピー」。付与後に255文字を超える場合は、元タイトル側を切り詰める）。

[マイテンプレート一覧画面](../../screens/my-templates.md)の`TemplateCard`にある「複製する」ボタンから呼ばれ、成功後は複製されたテンプレートの[テンプレート詳細画面](../../screens/template-detail.md)（工程1）へ遷移する。

[公開テンプレート詳細画面](../../screens/published-template-detail.md)の「マイテンプレートに追加」ボタンからも同じエンドポイントを呼ぶ（`:templateId`に公開テンプレートのIDを指定する）。この場合、複製先テンプレートの`source_published_template_id`に複製元のIDを記録する（`published_at`は複製先には引き継がず、複製先は非公開の状態で作成される）。
