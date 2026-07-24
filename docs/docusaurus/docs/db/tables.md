---
sidebar_position: 2
title: テーブル定義
---

# テーブル定義

`docs/README.md` C1（詳細設計）を正とする。

<a id="organizations"></a>

### organizations

| カラム     | 型                          | 制約                          |
| ---------- | --------------------------- | ----------------------------- |
| id         | UUID                        | PK, default gen_random_uuid() |
| name       | VARCHAR(255)                | NOT NULL                      |
| status     | ENUM('active','suspended')  | NOT NULL, default 'active'    |
| created_at | TIMESTAMPTZ                 | NOT NULL, default now()       |

v1では1組織のみ運用だが、将来の他社ライセンス提供（Phase3）を見据え最初から複数対応の構造で用意する。`status`が`suspended`になると、この会社に属する全ユーザーがログイン不可になる（[会社管理画面](../screens/company-management.md)参照）。

<a id="users"></a>

### users

| カラム                | 型                                    | 制約                          |
| --------------------- | -------------------------------------- | ----------------------------- |
| id                    | UUID                                   | PK                            |
| organization_id       | UUID                                   | NOT NULL, FK→organizations.id |
| identity_platform_uid | VARCHAR(128)                           | NOT NULL, UNIQUE              |
| email                 | VARCHAR(255)                           | NOT NULL, UNIQUE              |
| role                  | ENUM('user','admin','system_admin')    | NOT NULL, default 'user'      |
| display_name          | VARCHAR(100)                           |                               |
| status                | ENUM('active','disabled')              | NOT NULL, default 'active'    |
| created_at            | TIMESTAMPTZ                            | NOT NULL, default now()       |

INDEX: `organization_id`

`system_admin`は`admin`の権限をすべて含む上位ロール（自組織の案件・マイテンプレート・ユーザー管理に加え、[会社管理画面](../screens/company-management.md)にアクセスできる）。権限チェックは「`admin`専用機能：`role`が`admin`または`system_admin`」「会社管理機能：`role`が`system_admin`」という2段階で行う。

<a id="templates"></a>

### templates

| カラム                        | 型          | 制約                                                          |
| ------------------------------ | ----------- | --------------------------------------------------------------- |
| id                             | UUID        | PK, default gen_random_uuid()                                   |
| organization_id                | UUID        | NOT NULL, FK→organizations.id                                   |
| published_at                   | TIMESTAMPTZ | NULL可。非NULLなら公開中（[公開テンプレート一覧](../screens/published-templates.md)に表示される） |
| source_published_template_id   | UUID        | NULL可, FK→templates.id。公開テンプレートを複製して作られた場合の複製元 |
| created_at                     | TIMESTAMPTZ | NOT NULL, default now()                                         |

INDEX: `organization_id` ／ `published_at`（公開テンプレート一覧の絞り込み用）

テンプレート（7工程分のパック）そのもの。組織内に複数作成できる。「公開テンプレート」タグの表示条件（[マイテンプレート一覧画面](../screens/my-templates.md)）：`source_published_template_id`が非NULL、かつこのテンプレートの`template_versions`が1件のみ（未編集）の場合に表示する。新しいバージョンが保存された時点（`template_versions`が2件以上になった時点）でタグは消え、通常の「公開する」ボタンが表示される。

<a id="template_versions"></a>

### template_versions（追記型）

| カラム      | 型           | 制約                      |
| ------------ | ------------ | -------------------------- |
| id          | UUID         | PK                         |
| template_id | UUID         | NOT NULL, FK→templates.id  |
| title       | VARCHAR(255) | NOT NULL。テンプレート名   |
| version     | INTEGER      | NOT NULL                   |
| created_by  | UUID         | FK→users.id                |
| created_at  | TIMESTAMPTZ  | NOT NULL                   |

UNIQUE: `(template_id, version)`

1回の保存（`PUT /api/admin/templates/:templateId/stages/:stageKey`）でテンプレート全体が新バージョンとして追記される。`title`はテンプレート単位で1つ（どの工程タブから編集しても同じ値）。

<a id="projects"></a>

### projects

| カラム                  | 型                              | 制約                             |
| ----------------------- | ------------------------------- | -------------------------------- |
| id                      | UUID                            | PK                               |
| organization_id         | UUID                            | NOT NULL, FK                     |
| name                    | VARCHAR(255)                    | NOT NULL                         |
| template_id             | UUID                            | NOT NULL, FK→templates.id。参照するテンプレート（常に最新版を参照する＝ライブ参照） |
| current_stage           | ENUM(7工程キー)                 | NOT NULL, default 'requirements' |
| overall_status          | ENUM('in_progress','completed') | NOT NULL, default 'in_progress'  |
| created_by              | UUID                            | FK→users.id                      |
| created_at / updated_at | TIMESTAMPTZ                     | NOT NULL                         |

INDEX: `organization_id`, `overall_status`, `template_id`

<a id="project_stages"></a>

### project_stages（案件×工程で1レコード）

| カラム              | 型                                                                                        | 制約                                                                                                                         |
| ------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| id                  | UUID                                                                                      | PK                                                                                                                           |
| project_id          | UUID                                                                                      | NOT NULL, FK                                                                                                                 |
| stage_key           | ENUM('requirements','design','implementation','review','security','test','documentation') | NOT NULL                                                                                                                     |
| status              | ENUM('not_started','in_progress','quality_gate_pending','completed')                      | NOT NULL, default 'not_started'                                                                                              |
| answers             | JSONB                                                                                     | 質問ID→回答のマップ（例：`{"q1": "回答内容"}`。キーは対応する`question_templates.questions[].id`と一致させる）               |
| generated_prompt    | TEXT                                                                                      | 最新の生成結果のみ保持（`deliverables`と異なり版管理はしない。回答修正のたびに再生成・上書きされる）                         |
| quality_gate_result | JSONB                                                                                     | チェック項目ID→チェック有無・チェック者・日時（例：`{"item1": {"checked": true, "checkedBy": "uuid", "checkedAt": "..."}}`） |
| completed_at        | TIMESTAMPTZ                                                                               | NULL可                                                                                                                       |

UNIQUE: `(project_id, stage_key)` ／ INDEX: `project_id`

<a id="deliverables"></a>

### deliverables（追記型）

| カラム            | 型                           | 制約         |
| ----------------- | ---------------------------- | ------------ |
| id                | UUID                         | PK           |
| project_stage_id  | UUID                         | NOT NULL, FK |
| content           | TEXT                         |              |
| generation_method | ENUM('manual','ai_executed') | NOT NULL     |
| version           | INTEGER                      | NOT NULL     |
| updated_by        | UUID                         | FK→users.id  |
| created_at        | TIMESTAMPTZ                  | NOT NULL     |

INDEX: `(project_stage_id, version)`

<a id="question_templates-prompt_templates-quality_gate_items"></a>

### question_templates / prompt_templates / quality_gate_items（管理者編集用。版そのものはtemplate_versionsが持つ）

| カラム                            | 型              | 制約                                                                                                                                  |
| --------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| id                                | UUID            | PK                                                                                                                                    |
| template_version_id               | UUID            | NOT NULL, FK→template_versions.id                                                                                                    |
| stage_key                         | ENUM(7工程キー) | NOT NULL                                                                                                                              |
| questions / template_text / items | JSONB or TEXT   | 内容本体。`questions`の各要素は`{id, text, order}`（例：`{"id":"q1","text":"...","order":1}`）。`items`の各要素は`{id, label, order}` |

UNIQUE: `(template_version_id, stage_key)`

新しいバージョンを保存する際は、編集した工程だけでなく7工程分すべての行を新しい`template_version_id`に紐づけて複製する（未編集の6工程は直前バージョンの内容をそのままコピーする）。

<a id="api_usage_logs"></a>

### api_usage_logs

| カラム                       | 型            | 制約                                     |
| ---------------------------- | ------------- | ---------------------------------------- |
| id                           | UUID          | PK                                       |
| organization_id              | UUID          | NOT NULL, FK                             |
| project_stage_id             | UUID          | NULL可（工程に紐づかない呼び出しも想定） |
| input_tokens / output_tokens | INTEGER       |                                          |
| estimated_cost_usd           | NUMERIC(10,4) |                                          |
| called_at                    | TIMESTAMPTZ   | NOT NULL                                 |

INDEX: `(organization_id, called_at)`
