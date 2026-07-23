---
sidebar_position: 0
sidebar_label: 概要
title: 案件
---

# 案件

対応画面：[案件一覧](../../screens/project-list.md)・[案件詳細](../../screens/stage-workspace.md)

**対応テーブル**：[`projects`](../../db/tables.md#projects)（`docs/adf-design.md` C1）

## エンドポイント一覧

- [`GET /api/projects`](./get-projects.md)：案件一覧取得（7工程分のステータスサマリー付き）
- [`POST /api/projects`](./create-project.md)：案件作成
- [`GET /api/projects/:id`](./get-project.md)：案件詳細取得
