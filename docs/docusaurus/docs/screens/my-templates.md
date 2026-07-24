---
sidebar_position: 4
title: マイテンプレート一覧画面
---

# マイテンプレート一覧画面（管理者用）

- **URL**: `/admin/templates`
- **画面ファイル**: `app/src/app/(auth)/admin/templates/page.tsx`
- **コンポーネント**: `app/src/features/admin-templates/components/MyTemplateListScreen.tsx`

## 概要

管理者が作成したテンプレート（7工程分の質問セット・プロンプトテンプレート・品質ゲート項目のパック）を、カード形式で一覧表示する画面。管理者ロール（`role: admin`）のみアクセス可能。テンプレートは複数作成できる。

ページ自体はServer Componentで、`lib/api/adminTemplates/getStageTemplateList`（`fetchData`経由）を呼び出して初期データを取得する（`lib/services`は直接呼ばない。詳細は`CLAUDE.md`の「データ取得パターン」）。

## 主要コンポーネント

`docs/README.md` C3を参照。

| コンポーネント     | 役割                                                                     |
| ------------------- | -------------------------------------------------------------------------- |
| `TemplateCard`      | テンプレート名／現在バージョン／最終更新日時・更新者。カード内の「複製する」ボタンで現在有効な版の内容をコピーした新規テンプレートを作成する |
| `NewTemplateModal`  | テンプレート名の入力欄（255文字まで）。作成後は7工程とも空の内容のテンプレート詳細画面（工程1）へ遷移する |

## 使用API

| API                                                                          | 用途                       |
| -------------------------------------------------------------------------------- | -------------------------- |
| [`GET /api/admin/templates`](../api/admin-templates/list-templates.md)          | テンプレート概要一覧取得   |
| [`POST /api/admin/templates`](../api/admin-templates/create-template.md)        | テンプレート新規作成       |
| [`POST /api/admin/templates/:templateId/duplicate`](../api/admin-templates/duplicate-template.md) | テンプレートの複製 |

## 画面構成

テンプレートカード（`TemplateCard`）をクリックすると、そのテンプレートの[テンプレート詳細画面](./template-detail.md)（工程1）へ遷移する。

見出し右側の「新規作成」ボタンから`NewTemplateModal`を開いてテンプレートを作成できる。作成されたテンプレートは常に7工程分のレコードを持つ（工程だけを個別に作成することはできない）。

カード右上の「複製する」ボタンをクリックすると、そのテンプレートの現在有効な版をコピーした新規テンプレート（バージョン1から開始、既存の案件には影響しない）を作成し、複製先のテンプレート詳細画面（工程1）へ遷移する。既存のテンプレートを編集すると進行中の案件にも影響する（ライブ参照。[テンプレート詳細画面](./template-detail.md)参照）ため、案件へ影響を与えずに元の内容をベースに新しいバリエーションを作りたい場合の代替手段として使う。
