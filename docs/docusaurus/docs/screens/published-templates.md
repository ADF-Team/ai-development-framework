---
sidebar_position: 7
title: 公開テンプレート一覧画面
---

# 公開テンプレート一覧画面（全ユーザー閲覧可）

- **URL**: `/templates/published`
- **画面ファイル**: `app/src/app/(auth)/templates/published/page.tsx`
- **コンポーネント**: `app/src/features/published-templates/components/PublishedTemplateListScreen.tsx`

## 概要

管理者が公開したテンプレート（`templates.published_at`が非NULL）を、カード形式で一覧表示する画面。利用者・管理者・システム管理者のいずれもログインしていればアクセス可能（閲覧のみ）。

`AppSidebar`の「ライブラリ」グループから常に表示される（`docs/README.md` C3参照）。

ページ自体はServer Componentで、`lib/frontend/apiClient/publishedTemplates/getPublishedTemplateList`（`fetchData`経由）を呼び出して初期データを取得する（`service.ts`・`repository.ts`は直接呼ばない。詳細は`CLAUDE.md`の「データ取得パターン」）。

## 主要コンポーネント

`docs/README.md` C3を参照。

| コンポーネント             | 役割                                                                 |
| --------------------------- | ---------------------------------------------------------------------- |
| `PublishedTemplateCard`     | テンプレート名／現在バージョン／公開日時。クリックで[公開テンプレート詳細画面](./published-template-detail.md)へ遷移 |

## 使用API

| API                                                                                | 用途                       |
| ----------------------------------------------------------------------------------- | -------------------------- |
| [`GET /api/templates/published`](../api/published-templates/list-published-templates.md) | 公開テンプレート一覧取得   |

## 画面構成

公開テンプレートカード（`PublishedTemplateCard`）をクリックすると、そのテンプレートの[公開テンプレート詳細画面](./published-template-detail.md)へ遷移する。[マイテンプレート一覧画面](./my-templates.md)と異なり、新規作成・複製ボタンはこの画面には置かない（複製は詳細画面側の「マイテンプレートに追加」ボタンから行う）。

公開状態の切り替え（公開する／公開を取り下げる）は[マイテンプレート一覧画面](./my-templates.md)の`TemplateCard`から管理者が行う。テンプレートが非公開に戻された場合、この一覧には表示されなくなる。
