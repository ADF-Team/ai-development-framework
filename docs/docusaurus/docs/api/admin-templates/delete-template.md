---
sidebar_position: 10
sidebar_label: DELETE /templates/{templateId}
title: "DELETE /api/admin/templates/{templateId}"
---

# `DELETE /api/admin/templates/{templateId}`

<ApiEndpoint method="DELETE" path="/api/admin/templates/{templateId}" />

`admin`／`system_admin`ロールのみアクセス可。テンプレートを削除する。バージョン履歴・7工程分の質問セット・プロンプトテンプレート・品質ゲート項目もすべてカスケード削除される（`schema.prisma`の`onDelete: Cascade`）。取り消し不可。

このテンプレートを複製元として作成された他のテンプレート（`source_published_template_id`が本テンプレートを指すもの）は削除されず、`source_published_template_id`が`null`になるだけ（`onDelete: SetNull`）。

## Response 204

ボディなし。

## エラー

- `404`：`templateId`が存在しない場合（他組織のテンプレートを含む）

[マイテンプレート一覧画面](../../screens/my-templates.md)の`TemplateCard`にある削除アイコンボタンから、確認モーダル（`DeleteTemplateModal`）を経て呼ばれる。

## 案件からの参照について

2026-08時点では`projects`（案件）APIが未実装のため、このテンプレートを参照している進行中の案件があるかどうかのチェックは行わない。`projects`実装後は、[`GET /api/admin/templates/:templateId/projects`](./get-template-projects.md)と同様の確認（参照中の案件がある場合の警告・ブロック）を追加すべき点に注意。
