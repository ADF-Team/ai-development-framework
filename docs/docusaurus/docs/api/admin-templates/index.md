---
sidebar_position: 0
sidebar_label: 概要
title: 管理者：テンプレート
---

# 管理者：テンプレート

対応画面：[マイテンプレート一覧画面](../../screens/my-templates.md)、[テンプレート詳細画面](../../screens/template-detail.md)

**対応テーブル**：[`templates` / `template_versions` / `question_templates` / `prompt_templates` / `quality_gate_items`](../../db/tables.md#question_templates-prompt_templates-quality_gate_items)（`docs/README.md` C1）

管理者ロール（`role: admin`）のみアクセス可（`403`：一般利用者がアクセスした場合）。テンプレートは複数作成でき、それぞれが7工程分の質問セット・プロンプトテンプレート・品質ゲート項目のパックを持つ。

## エンドポイント一覧

- [`GET /api/admin/templates`](./list-templates.md)：テンプレート概要一覧取得
- [`POST /api/admin/templates`](./create-template.md)：テンプレート新規作成
- [`GET /api/admin/templates/:templateId/stages/:stageKey`](./get-template.md)：テンプレート名・指定工程の質問セット・プロンプトテンプレート・品質ゲート項目・バージョン履歴の取得
- [`PUT /api/admin/templates/:templateId/stages/:stageKey`](./put-template.md)：テンプレート名・指定工程の質問セット・プロンプトテンプレート・品質ゲート項目の編集
- [`GET /api/admin/templates/:templateId/stages/:stageKey/versions/:version`](./get-template-version.md)：特定バージョン・指定工程の内容取得（バージョン差分表示用）
- [`GET /api/admin/templates/:templateId/projects`](./get-template-projects.md)：このテンプレートを参照している進行中の案件一覧取得（保存時の影響確認用）
- [`POST /api/admin/templates/:templateId/duplicate`](./duplicate-template.md)：テンプレートの複製
