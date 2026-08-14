---
sidebar_position: 0
sidebar_label: 概要
title: 工程
---

# 工程

対応画面：[案件詳細（工程別ワークスペース）](../../screens/stage-workspace.md)

**対応テーブル**：[`project_stages`](../../db/tables.md#project_stages)・[`deliverables`](../../db/tables.md#deliverables)（`docs/README.md` C1）

`stageKey`は7工程マスタ（`requirements` / `design` / `implementation` / `review` / `security` / `test` / `documentation`）のいずれか。

ログイン済みであれば全ロールアクセス可（`requireUser()`）。案件と同じく常にアクセス者自身の`organization_id`にスコープされ、他組織の案件・工程はIDを直接指定しても取得・操作できない（存在しない場合と同じ`404`）。

**2026-08時点で、[`POST .../execute`](./execute.md)を除く5エンドポイントは実際にPrisma経由でDBアクセスするよう実装されている**。`POST .../execute`のみAnthropic API未連携のため引き続きモック実装のまま（`src/lib/services/projects.ts`のプロセス内メモリストアを参照する。認証チェック・組織スコープも未実装で、実DBの案件IDを渡しても常に`404`になる点に注意。詳細は[該当ページ](./execute.md)参照）。

## エンドポイント一覧

- [`GET /api/projects/:id/stages/:stageKey`](./get-stage.md)：質問・回答・プロンプト・成果物・品質ゲート状況を取得
- [`POST /api/projects/:id/stages/:stageKey/answers`](./save-answers.md)：質問への回答を保存
- [`POST /api/projects/:id/stages/:stageKey/generate-prompt`](./generate-prompt.md)：回答をテンプレートに埋め込みプロンプトを生成
- [`POST /api/projects/:id/stages/:stageKey/execute`](./execute.md)：Claude APIを呼び出し、成果物を生成・保存
- [`PATCH /api/projects/:id/stages/:stageKey/deliverable`](./update-deliverable.md)：成果物を編集・保存
- [`POST /api/projects/:id/stages/:stageKey/quality-gate`](./quality-gate.md)：品質ゲートのチェック結果を送信し、通過判定・次工程への移行を行う

状態値・状態遷移の定義は[状態値の定義](../status-values.md)を参照。
