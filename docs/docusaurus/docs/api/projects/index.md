---
sidebar_position: 0
sidebar_label: 概要
title: 案件
---

# 案件

対応画面：[案件一覧](../../screens/project-list.md)・[案件詳細](../../screens/stage-workspace.md)

**対応テーブル**：[`projects`](../../db/tables.md#projects)（`docs/README.md` C1）

ログイン済みであれば全ロールアクセス可（`requireUser()`）。常にアクセス者自身の`organization_id`にスコープされ、他組織の案件は一覧に出てこない・IDを直接指定しても取得できない（存在しない場合と同じ`404`）。

**2026-08時点で、実際にPrisma経由でDBアクセスするよう実装されているのはこのセクションの3エンドポイント（一覧・作成・詳細取得）のみ**。工程別の質問回答・プロンプト生成・AI実行・成果物編集・品質ゲート（[工程](../stages/index.md)配下）は引き続きモック実装のまま。

## エンドポイント一覧

- [`GET /api/projects`](./get-projects.md)：案件一覧取得（7工程分のステータスサマリー付き）
- [`POST /api/projects`](./create-project.md)：案件作成
- [`GET /api/projects/:id`](./get-project.md)：案件詳細取得
