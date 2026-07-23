---
sidebar_position: 4
title: テンプレート管理画面
---

# テンプレート管理画面（管理者用）

- **URL**: `/admin/templates`, `/admin/templates/[stageKey]`
- **画面ファイル**: `app/src/app/(dashboard)/admin/templates/page.tsx`, `app/src/app/(dashboard)/admin/templates/[stageKey]/page.tsx`
- **コンポーネント**: `app/src/features/admin-templates/components/TemplateManagementScreen.tsx`

## 概要

管理者が、7工程それぞれの「質問セット」「プロンプトテンプレート」「品質ゲートのチェック項目」を編集・バージョン管理する画面。管理者ロール（`role: admin`）のみアクセス可能。

`question_templates` / `prompt_templates` / `quality_gate_items`はいずれも追記型（Append-only）のため、保存のたびに新しいバージョンが追加され、過去バージョンも参照できる。

## 主要コンポーネント

`docs/README.md` C3を参照。

| コンポーネント           | 役割                                           |
| ------------------------ | ---------------------------------------------- |
| `StageSelector`          | 7工程の選択タブ                                |
| `QuestionSetEditor`      | 質問の追加・編集・削除・並べ替え               |
| `PromptTemplateEditor`   | テキストエリア。回答プレースホルダーの挿入補助 |
| `QualityGateItemsEditor` | チェック項目の追加・編集・削除                 |
| `VersionHistoryPanel`    | 過去バージョンの確認                           |

## 使用API

| API                                                                            | 用途                                                     |
| ------------------------------------------------------------------------------ | -------------------------------------------------------- |
| [`GET /api/admin/templates/:stageKey`](../api/admin-templates/get-template.md) | 質問セット・プロンプトテンプレート・品質ゲート項目の取得 |
| [`PUT /api/admin/templates/:stageKey`](../api/admin-templates/put-template.md) | 質問セット・プロンプトテンプレート・品質ゲート項目の編集 |

## プレースホルダー記法

`PromptTemplateEditor`で編集するテンプレート本文には`{{answer:質問ID}}`形式のプレースホルダーを埋め込む。質問IDは同じ工程の`QuestionSetEditor`で定義した質問の`id`と一致させる必要がある（工程1「要件定義」のテンプレート実装例は`docs/README.md` C5を参照）。
