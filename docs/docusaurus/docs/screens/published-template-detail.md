---
sidebar_position: 8
title: 公開テンプレート詳細画面
---

# 公開テンプレート詳細画面（全ユーザー閲覧可）

- **URL**: `/templates/published/[templateId]`
- **画面ファイル**: `app/src/app/(auth)/templates/published/[templateId]/page.tsx`
- **コンポーネント**: `app/src/features/published-templates/components/PublishedTemplateDetailScreen.tsx`

## 概要

[公開テンプレート一覧画面](./published-templates.md)からカードを選択すると遷移する画面。公開テンプレートの7工程分の「質問セット」「プロンプトテンプレート」「品質ゲートのチェック項目」を読み取り専用で閲覧する。利用者・管理者・システム管理者のいずれもアクセス可能。

[テンプレート詳細画面](./template-detail.md)と異なり編集はできない。管理者権限（管理者・システム管理者）でログインしている場合のみ、「マイテンプレートに追加」ボタンが表示される。

## 主要コンポーネント

`docs/README.md` C3を参照。

| コンポーネント             | 役割                                                                                       |
| --------------------------- | -------------------------------------------------------------------------------------------- |
| `StageSelector`              | 7工程の選択タブ。[テンプレート詳細画面](./template-detail.md)と共通のコンポーネントを流用し、読み取り専用モードで表示 |
| 質問セット／プロンプトテンプレート／品質ゲート項目の読み取り専用ビュー | `QuestionSetEditor` `PromptTemplateEditor` `QualityGateItemsEditor`を読み取り専用モードで流用 |
| `AddToMyTemplatesButton`     | 管理者権限（管理者・システム管理者）にのみ表示。クリックで独立したコピーを作成し、[マイテンプレート一覧画面](./my-templates.md)（複製されたテンプレートの詳細画面）へ遷移する |

## 使用API

| API                                                                                           | 用途                                                       |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| [`GET /api/templates/published/:templateId`](../api/published-templates/get-published-template.md) | 公開テンプレートの7工程分の内容取得                         |
| [`POST /api/admin/templates/:templateId/duplicate`](../api/admin-templates/duplicate-template.md)  | `AddToMyTemplatesButton`クリック時、マイテンプレートへ独立したコピーを作成 |

## マイテンプレートへの追加

`AddToMyTemplatesButton`をクリックすると、この公開テンプレートのIDを複製元として[`POST /api/admin/templates/:templateId/duplicate`](../api/admin-templates/duplicate-template.md)を呼ぶ（既存の「複製する」と同じエンドポイント・同じロジック）。

- 複製先テンプレートの`source_published_template_id`に複製元（この公開テンプレート）のIDが記録される
- `published_at`は複製先には引き継がれない（複製先は常に非公開の状態で作成される）
- 成功後は複製されたテンプレートの[テンプレート詳細画面](./template-detail.md)（工程1）へ遷移する
- [マイテンプレート一覧画面](./my-templates.md)の`TemplateCard`は、複製直後（`template_versions`が1件のみ・未編集）の間は「公開テンプレート」タグを表示する。新しいバージョンを保存すると通常のカード表示（「公開する」ボタン）に戻る
