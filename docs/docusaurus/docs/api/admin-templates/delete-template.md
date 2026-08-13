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
- `409`：このテンプレートを参照している案件（`projects.template_id`）が1件でも存在する場合（進行中・完了済みを問わない。`detail`: `このテンプレートを参照している案件があるため削除できません。`）。案件からの参照は`Project.templateId`が`onDelete`指定なしの外部キー（Postgresのデフォルトで`ON DELETE RESTRICT`）のため、このチェックを素通りしてもDBの制約違反（P2003）を検知し、汎用的な`409`に変換する（`src/lib/services/ServiceError.ts`の`mapPrismaError`。二重の安全網）

[マイテンプレート一覧画面](../../screens/my-templates.md)の`TemplateCard`にある削除アイコンボタンから、確認モーダル（`DeleteTemplateModal`）を経て呼ばれる。フロント側では参照中の案件があるかどうかを事前チェックしていない（`409`が返ってきた場合、エラートーストで通知するのみ）。
