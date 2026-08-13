---
sidebar_position: 2
sidebar_label: GET /templates/published/{templateId}
title: "GET /api/templates/published/{templateId}"
---

# `GET /api/templates/published/{templateId}`

<ApiEndpoint method="GET" path="/api/templates/published/{templateId}" />

ログイン済みであれば全ロールアクセス可。アクセス者自身の組織内の公開テンプレートの現在有効な版の内容（7工程分の質問セット・プロンプトテンプレート・品質ゲート項目）を返す。非公開・他組織のテンプレートIDを指定した場合は`404`。

## Response 200

```json
{
  "id": "uuid",
  "title": "標準テンプレート",
  "version": 3,
  "publishedAt": "2026-07-20T00:00:00Z",
  "stages": [
    {
      "stageKey": "requirements",
      "questions": [{ "id": "q1", "text": "...", "order": 1 }],
      "promptTemplate": "...{{answer:q1}}...",
      "qualityGateItems": [{ "id": "item1", "label": "...", "order": 1 }]
    }
  ]
}
```

[公開テンプレート詳細画面](../../screens/published-template-detail.md)で7工程分の内容を読み取り専用表示するために使う。

## エラー

- `404`：指定したテンプレートIDが存在しない、または非公開
