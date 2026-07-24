---
sidebar_position: 2
title: 案件一覧画面
---

# 案件一覧画面

- **URL**: `/projects`
- **画面ファイル**: `app/src/app/(auth)/projects/page.tsx`
- **コンポーネント**: `app/src/features/projects/components/ProjectListScreen.tsx`

## 概要

進行中・完了案件を一覧表示し、案件ごとに7工程（要件定義〜ドキュメント）の進捗ステータスを表示する画面。新規案件の作成もここから行う。

ページ自体はServer Componentで、`lib/api/projects/getProjectList`と`lib/api/adminTemplates/getStageTemplateList`（いずれも`fetchData`経由）を並行して呼び出し、案件一覧と（`NewProjectModal`のテンプレート選択欄用の）テンプレート一覧を初期データとして取得する（`lib/services`は直接呼ばない。詳細は`CLAUDE.md`の「データ取得パターン」）。

## 主要コンポーネント

`docs/README.md` C3を参照。

| コンポーネント      | 役割                            |
| ------------------- | ------------------------------- |
| `ProjectListHeader` | 新規作成ボタン                  |
| `ProjectCard`       | 案件名／7工程の進捗バー／作成日 |
| `NewProjectModal`   | 案件名の入力欄（255文字まで）と、テンプレートの選択欄（プルダウン）。[テンプレート詳細画面](./template-detail.md)の「このテンプレートで案件を作成する」から`?newFromTemplate=:templateId`付きで遷移した場合は、そのテンプレートが選択済みの状態で開く |

## 使用API

| API                                                                | 用途                             |
| --------------------------------------------------------------------- | -------------------------------- |
| [`GET /api/projects`](../api/projects/get-projects.md)               | 案件一覧＋工程別ステータス取得   |
| [`POST /api/projects`](../api/projects/create-project.md)            | 新規案件作成（テンプレートを指定） |
| [`GET /api/admin/templates`](../api/admin-templates/list-templates.md) | `NewProjectModal`のテンプレート選択肢取得 |

## 画面構成

案件カード（`ProjectCard`）は`stageStatuses`（7工程分のステータス）を進捗バーとして表示する。カードをクリックすると[案件詳細画面](./stage-workspace.md)（現在の工程から再開）へ遷移する。

新規案件作成時は、選択したテンプレートIDを指定して`POST /api/projects`を呼ぶ。サーバー側で7工程分の`project_stages`レコードが`not_started`で一括作成され（工程1のみ`in_progress`）、以降この案件の質問セット・プロンプトテンプレート・品質ゲート項目は、指定したテンプレートの現在有効な版を常に参照する（ライブ参照。テンプレート編集は進行中の案件にも反映される）。作成後は案件一覧内にカードが追加され、案件詳細画面へは案件カードから改めて遷移する。
