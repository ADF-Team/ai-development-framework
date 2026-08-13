---
sidebar_position: 0
sidebar_label: 概要
title: 管理者：テンプレート
---

# 管理者：テンプレート

対応画面：[マイテンプレート一覧画面](../../screens/my-templates.md)、[テンプレート詳細画面](../../screens/template-detail.md)

**対応テーブル**：[`templates` / `template_versions` / `question_templates` / `prompt_templates` / `quality_gate_items`](../../db/tables.md#question_templates-prompt_templates-quality_gate_items)（`docs/README.md` C1）

`role`が`admin`または`system_admin`のユーザーのみアクセス可（`requireAdmin()`。403：`user`ロールがアクセスした場合）。常にアクセス者自身の`organization_id`にスコープされ、他組織のテンプレートは一覧に出てこない・IDを直接指定しても操作できない（存在しない場合と同じ`404`）。テンプレートは複数作成でき、それぞれが7工程分の質問セット・プロンプトテンプレート・品質ゲート項目のパックを持つ。

**2026-08時点で、以下のエンドポイントは全てPrisma経由で実DBにアクセスする**（`Template`・`TemplateVersion`・`QuestionTemplate`・`PromptTemplate`・`QualityGateItem`テーブルに加え、[案件](../projects/index.md)実装後は`GET .../projects`が`Project`テーブルも参照する）。

同じ組織内でテンプレート名（現在有効な版のタイトル）が重複することは、作成・複製・リネームのいずれの経路でも許可されない（`409`）。また、[案件](../projects/index.md)から参照されているテンプレートは削除できない（`409`。[`DELETE`](./delete-template.md)参照）。

## エンドポイント一覧

- [`GET /api/admin/templates`](./list-templates.md)：テンプレート概要一覧取得
- [`POST /api/admin/templates`](./create-template.md)：テンプレート新規作成
- [`GET /api/admin/templates/:templateId/stages/:stageKey`](./get-template.md)：テンプレート名・指定工程の質問セット・プロンプトテンプレート・品質ゲート項目・バージョン履歴の取得
- [`PUT /api/admin/templates/:templateId/stages/:stageKey`](./put-template.md)：テンプレート名・指定工程の質問セット・プロンプトテンプレート・品質ゲート項目の編集
- [`GET /api/admin/templates/:templateId/stages/:stageKey/versions/:version`](./get-template-version.md)：特定バージョン・指定工程の内容取得（バージョン差分表示用）
- [`GET /api/admin/templates/:templateId/projects`](./get-template-projects.md)：このテンプレートを参照している進行中の案件一覧取得（保存時の影響確認用）
- [`POST /api/admin/templates/:templateId/duplicate`](./duplicate-template.md)：テンプレートの複製（[公開テンプレート](../published-templates/index.md)を複製元に指定した場合も同じロジックで動作する）
- [`POST /api/admin/templates/:templateId/publish`](./publish-template.md)：テンプレートを公開状態にする
- [`POST /api/admin/templates/:templateId/unpublish`](./unpublish-template.md)：テンプレートを非公開状態に戻す
- [`DELETE /api/admin/templates/:templateId`](./delete-template.md)：テンプレートを削除（バージョン履歴も含めて完全に削除。取り消し不可）
