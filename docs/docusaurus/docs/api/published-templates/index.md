---
sidebar_position: 0
sidebar_label: 概要
title: 公開テンプレート
---

# 公開テンプレート

対応画面：[公開テンプレート一覧画面](../../screens/published-templates.md)、[公開テンプレート詳細画面](../../screens/published-template-detail.md)

**対応テーブル**：[`templates` / `template_versions` / `question_templates` / `prompt_templates` / `quality_gate_items`](../../db/tables.md#question_templates-prompt_templates-quality_gate_items)（`docs/README.md` C1）

利用者・管理者・システム管理者のいずれもアクセス可（`requireUser()`。ログイン済みであれば全ロール閲覧のみ可能）。管理者が[公開したテンプレート](../admin-templates/publish-template.md)（`templates.published_at`が非NULL）だけを対象にする。

常にアクセス者自身の`organization_id`にスコープされ、他組織が公開したテンプレートは見えない（組織をまたいだ公開ではない）。`templates.source_published_template_id`の設計注記にある「将来組織をまたいだ複製にも対応」は2026-08時点では未対応。

## エンドポイント一覧

- [`GET /api/templates/published`](./list-published-templates.md)：公開テンプレートの一覧取得
- [`GET /api/templates/published/:templateId`](./get-published-template.md)：公開テンプレートの詳細（7工程分の内容）取得

公開テンプレートをマイテンプレートへ複製する操作は、既存の[`POST /api/admin/templates/:templateId/duplicate`](../admin-templates/duplicate-template.md)（管理者ロールのみ）を流用する。
