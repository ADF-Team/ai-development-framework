---
sidebar_position: 5
sidebar_label: GET /templates/{templateId}/stages/{stageKey}/versions/{version}
title: "GET /api/admin/templates/{templateId}/stages/{stageKey}/versions/{version}"
---

# `GET /api/admin/templates/{templateId}/stages/{stageKey}/versions/{version}`

<ApiEndpoint method="GET" path="/api/admin/templates/{templateId}/stages/{stageKey}/versions/{version}" />

`admin`／`system_admin`ロールのみアクセス可。アクセス者自身の組織に属するテンプレートのみ取得可能。[`VersionHistoryPanel`](../../screens/template-detail.md)で特定バージョンをクリックした際、差分モーダル（`VersionDiffModal`）表示のために該当バージョン・指定工程の内容を取得する。

## Response 200

```json
{
  "templateId": "uuid",
  "stageKey": "design",
  "title": "標準テンプレート",
  "questions": [{ "id": "q1", "text": "...", "order": 1 }],
  "promptTemplate": "...{{answer:q1}}...",
  "qualityGateItems": [{ "id": "item1", "label": "...", "order": 1 }],
  "version": 2
}
```

## エラー

- `404`：以下のいずれか
  - `templateId`が存在しない（他組織のテンプレートを含む）
  - `stageKey`が7工程マスタのいずれにも一致しない
  - 指定した`version`番号のバージョンが存在しない

## 差分表示の仕組み

`VersionDiffModal`は、選択したバージョンと1つ前のバージョン（`version - 1`）をそれぞれ本APIで取得し、クライアント側で行単位の差分（`diff`パッケージの`diffLines`）を計算して表示する（テンプレート名・質問セット・プロンプトテンプレート・品質ゲート項目の4セクション）。初版（`version === 1`）を選択した場合は、比較対象が存在しないため空の内容と比較し、全内容が新規追加として表示される。
