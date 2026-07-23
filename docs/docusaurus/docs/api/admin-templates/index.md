---
sidebar_position: 0
sidebar_label: 概要
title: 管理者：テンプレート
---

# 管理者：テンプレート

対応画面：[テンプレート管理画面](../../screens/admin-templates.md)

**対応テーブル**：[`question_templates` / `prompt_templates` / `quality_gate_items`](../../db/tables.md#question_templates-prompt_templates-quality_gate_items)（`docs/README.md` C1）

管理者ロール（`role: admin`）のみアクセス可（`403`：一般利用者がアクセスした場合）。

## エンドポイント一覧

- [`GET /api/admin/templates/:stageKey`](./get-template.md)：質問セット・プロンプトテンプレート・品質ゲート項目の取得
- [`PUT /api/admin/templates/:stageKey`](./put-template.md)：質問セット・プロンプトテンプレート・品質ゲート項目の編集
