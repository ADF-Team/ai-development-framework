---
sidebar_position: 5
title: テンプレート詳細画面
---

# テンプレート詳細画面（管理者用）

- **URL**: `/admin/templates/[templateId]/[stageKey]`
- **画面ファイル**: `app/src/app/(auth)/admin/templates/[templateId]/[stageKey]/page.tsx`（`/admin/templates/[templateId]/page.tsx`は工程1へのリダイレクト用）
- **コンポーネント**: `app/src/features/admin-templates/components/TemplateDetailScreen.tsx`

## 概要

[マイテンプレート一覧画面](./my-templates.md)からテンプレートカードを選択すると遷移する画面。該当テンプレートの、選択中の工程の「質問セット」「プロンプトテンプレート」「品質ゲートのチェック項目」を編集する。テンプレート名・バージョン履歴はテンプレート全体で共有される（工程タブを切り替えても同じ値）。管理者ロール（`role: admin`）のみアクセス可能。

`question_templates` / `prompt_templates` / `quality_gate_items`はいずれも追記型（Append-only）のため、保存のたびに新しいバージョンが追加され、過去バージョンも参照できる。

テンプレート名の変更／質問の追加・削除／プロンプトテンプレートの編集／品質ゲート項目の追加・削除は、いずれもその場では保存されない（画面内の一時的な編集状態として保持される）。画面見出し右側の保存ボタンを押した時点で、まとめて1つの新バージョンとして追記保存される。

案件はテンプレートを常に最新版でライブ参照するため、このテンプレートを参照している進行中の案件がある状態で保存すると、その案件の質問セット・プロンプトテンプレート・品質ゲート項目も変わる。保存ボタン押下時にその影響を確認できる（下記「保存時の影響確認」参照）。

## 主要コンポーネント

`docs/README.md` C3を参照。

| コンポーネント           | 役割                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------ |
| `StageSelector`          | 7工程の選択タブ。切り替えると同画面内で該当工程のテンプレート詳細に遷移する          |
| テンプレート名入力欄     | 画面見出し。枠線付きの入力欄として表示し、編集可能であることが分かるようにする。工程名は小さなラベルとして上に表示する。初期値は工程名だが自由に編集できる。255文字まで |
| `QuestionSetEditor`      | 質問の追加・削除                                                                    |
| `PromptTemplateEditor`   | テキストエリア。回答プレースホルダーの挿入補助。縦幅は固定で、超過分は内部スクロール |
| `QualityGateItemsEditor` | チェック項目の追加・削除                                                            |
| `VersionHistoryPanel`    | 過去バージョンの一覧。バージョンをクリックすると`VersionDiffModal`を開く            |
| `VersionDiffModal`       | クリックしたバージョンと1つ前のバージョンの差分を表示するモーダル（下記参照）        |
| 保存ボタン               | 画面見出しの右側に配置。テンプレート名・質問セット・プロンプトテンプレート・品質ゲート項目への変更をまとめて新バージョンとして保存する |
| `SaveImpactModal`        | 保存ボタン押下時、このテンプレートを参照している進行中の案件が1件以上ある場合に表示。対象案件名の一覧と、保存すると各案件の内容も変わる旨を表示し、続行を確認する（下記「保存時の影響確認」参照） |
| 「このテンプレートで案件を作成する」ボタン | クリックで[案件一覧画面](./project-list.md)へ遷移し、このテンプレートが選択済みの状態で`NewProjectModal`が開く（`/projects?newFromTemplate=:templateId`） |

## 使用API

| API                                                                                              | 用途                                                       |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| [`GET /api/admin/templates/:templateId/stages/:stageKey`](../api/admin-templates/get-template.md)  | テンプレート名・質問セット・プロンプトテンプレート・品質ゲート項目・バージョン履歴の取得 |
| [`PUT /api/admin/templates/:templateId/stages/:stageKey`](../api/admin-templates/put-template.md)  | テンプレート名・質問セット・プロンプトテンプレート・品質ゲート項目の編集（新バージョンとして保存） |
| [`GET /api/admin/templates/:templateId/stages/:stageKey/versions/:version`](../api/admin-templates/get-template-version.md) | バージョン差分表示用に、特定バージョンの内容を取得        |
| [`GET /api/admin/templates/:templateId/projects`](../api/admin-templates/get-template-projects.md) | 保存ボタン押下時、影響を受ける進行中の案件一覧を取得       |

## プレースホルダー記法

`PromptTemplateEditor`で編集するテンプレート本文には`{{answer:質問ID}}`形式のプレースホルダーを埋め込む。質問IDは同じ工程の`QuestionSetEditor`で定義した質問の`id`と一致させる必要がある（工程1「要件定義」のテンプレート実装例は`docs/README.md` C5を参照）。

## バージョン差分モーダル（`VersionDiffModal`）

`VersionHistoryPanel`で任意のバージョンをクリックすると、そのバージョンと1つ前のバージョン（`version - 1`）を[`GET /api/admin/templates/:templateId/stages/:stageKey/versions/:version`](../api/admin-templates/get-template-version.md)でそれぞれ取得し、クライアント側で行単位の差分（`diff`パッケージの`diffLines`）を計算して表示する。

- テンプレート名・質問セット・プロンプトテンプレート・品質ゲート項目の4セクションごとに差分を表示する（質問セット・品質ゲート項目は、各項目のテキストを1行1項目として比較する）
- 追加行はアクセントカラー背景、削除行はdangerカラー背景＋取り消し線で表示する（色は`global.css`のCSS変数のみ使用し、ハードコードしない）
- 初版（`version === 1`）を選択した場合は比較対象が存在しないため、空の内容と比較し、全内容が新規追加として表示される

## 保存時の影響確認（`SaveImpactModal`）

案件はテンプレートを作成時に選んだまま常に最新版でライブ参照する（`docs/README.md` C4「案件作成時の初期化ロジック」参照）。そのため、既存テンプレートの保存は、それを参照している進行中の案件にも即座に影響する。

保存ボタンを押すと、入力内容のバリデーション後、まず[`GET /api/admin/templates/:templateId/projects`](../api/admin-templates/get-template-projects.md)でこのテンプレートを参照する進行中の案件を取得する。

- **1件以上ある場合**：`SaveImpactModal`を開き、対象案件名の一覧と「保存すると、これらの案件の質問セット・プロンプトテンプレート・品質ゲート項目も変更されます」という確認メッセージを表示する。「保存する」を押すと[`PUT /api/admin/templates/:templateId/stages/:stageKey`](../api/admin-templates/put-template.md)を呼ぶ。「キャンセル」を押すとモーダルを閉じ、保存は行わない
- **0件の場合**：モーダルを表示せず、そのまま`PUT`を呼んで保存する

進行中の案件に影響を与えずに元の内容をベースに編集したい場合は、[マイテンプレート一覧画面](./my-templates.md)の`TemplateCard`にある「複製する」ボタンで独立した新規テンプレートを作成し、そちらを編集する（複製先は既存のどの案件にも参照されていないため、編集しても他の案件には影響しない）。
