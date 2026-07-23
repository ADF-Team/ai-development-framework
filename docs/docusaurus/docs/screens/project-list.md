---
sidebar_position: 2
title: 案件一覧画面
---

# 案件一覧画面

- **URL**: `/projects`
- **画面ファイル**: `app/src/app/(dashboard)/projects/page.tsx`
- **コンポーネント**: `app/src/features/projects/components/ProjectListScreen.tsx`

## 概要

進行中・完了案件を一覧表示し、案件ごとに7工程（要件定義〜ドキュメント）の進捗ステータスを表示する画面。新規案件の作成もここから行う。

ページ自体はServer Componentで、`lib/services/projects`を直接呼び出して初期データを取得する（`/api/projects`をfetchで叩かない。詳細は`CLAUDE.md`の「データ取得パターン」）。

## 主要コンポーネント

`docs/adf-design.md` C3を参照。

| コンポーネント       | 役割                                             |
| --------------------- | ------------------------------------------------- |
| `ProjectListHeader`   | 新規作成ボタン                                   |
| `ProjectCard`         | 案件名／7工程の進捗バー／作成日                  |
| `NewProjectModal`     | 新規案件作成モーダル                             |

## 使用API

| API                                            | 用途             |
| ----------------------------------------------- | ---------------- |
| [`GET /api/projects`](../api/projects/get-projects.md) | 案件一覧＋工程別ステータス取得 |
| [`POST /api/projects`](../api/projects/create-project.md) | 新規案件作成      |

## 画面構成

案件カード（`ProjectCard`）は`stageStatuses`（7工程分のステータス）を進捗バーとして表示する。カードをクリックすると[案件詳細画面](./stage-workspace.md)（現在の工程から再開）へ遷移する。

新規案件作成時は、サーバー側で7工程分の`project_stages`レコードが`not_started`で一括作成され、工程1（要件定義）から開始する状態で案件詳細画面へ遷移する。
