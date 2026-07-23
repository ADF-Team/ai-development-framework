---
sidebar_position: 2
title: テーブル定義
---

# テーブル定義

`docs/adf-design.md` C1（詳細設計）を正とする。

<a id="organizations"></a>

### organizations

| カラム     | 型           | 制約                          |
| ---------- | ------------ | ----------------------------- |
| id         | UUID         | PK, default gen_random_uuid() |
| name       | VARCHAR(255) | NOT NULL                      |
| created_at | TIMESTAMPTZ  | NOT NULL, default now()       |

v1では1組織のみ運用だが、将来の他社ライセンス提供を見据え最初から用意する。

<a id="users"></a>

### users

| カラム                 | 型                         | 制約                          |
| ---------------------- | -------------------------- | ----------------------------- |
| id                     | UUID                       | PK                             |
| organization_id        | UUID                       | NOT NULL, FK→organizations.id |
| identity_platform_uid  | VARCHAR(128)               | NOT NULL, UNIQUE               |
| email                  | VARCHAR(255)               | NOT NULL, UNIQUE               |
| role                   | ENUM('user','admin')       | NOT NULL, default 'user'       |
| display_name           | VARCHAR(100)                |                                |
| status                 | ENUM('active','disabled')  | NOT NULL, default 'active'     |
| created_at             | TIMESTAMPTZ                 | NOT NULL, default now()        |

INDEX: `organization_id`

<a id="projects"></a>

### projects

| カラム                  | 型                               | 制約                              |
| ------------------------ | --------------------------------- | ---------------------------------- |
| id                       | UUID                               | PK                                  |
| organization_id          | UUID                               | NOT NULL, FK                       |
| name                     | VARCHAR(255)                       | NOT NULL                           |
| current_stage            | ENUM(7工程キー)                    | NOT NULL, default 'requirements'   |
| overall_status           | ENUM('in_progress','completed')    | NOT NULL, default 'in_progress'    |
| created_by               | UUID                               | FK→users.id                        |
| created_at / updated_at  | TIMESTAMPTZ                        | NOT NULL                           |

INDEX: `organization_id`, `overall_status`

<a id="project_stages"></a>

### project_stages（案件×工程で1レコード）

| カラム              | 型                                                                                        | 制約                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| id                   | UUID                                                                                        | PK                                                                                                                              |
| project_id           | UUID                                                                                        | NOT NULL, FK                                                                                                                    |
| stage_key            | ENUM('requirements','design','implementation','review','security','test','documentation')  | NOT NULL                                                                                                                         |
| status               | ENUM('not_started','in_progress','quality_gate_pending','completed')                        | NOT NULL, default 'not_started'                                                                                                  |
| answers              | JSONB                                                                                       | 質問ID→回答のマップ（例：`{"q1": "回答内容"}`。キーは対応する`question_templates.questions[].id`と一致させる）                  |
| generated_prompt     | TEXT                                                                                        | 最新の生成結果のみ保持（`deliverables`と異なり版管理はしない。回答修正のたびに再生成・上書きされる）                            |
| quality_gate_result  | JSONB                                                                                       | チェック項目ID→チェック有無・チェック者・日時（例：`{"item1": {"checked": true, "checkedBy": "uuid", "checkedAt": "..."}}`）    |
| completed_at         | TIMESTAMPTZ                                                                                 | NULL可                                                                                                                            |

UNIQUE: `(project_id, stage_key)` ／ INDEX: `project_id`

<a id="deliverables"></a>

### deliverables（追記型）

| カラム             | 型                             | 制約         |
| ------------------- | -------------------------------- | ------------- |
| id                  | UUID                              | PK            |
| project_stage_id    | UUID                              | NOT NULL, FK  |
| content             | TEXT                              |               |
| generation_method   | ENUM('manual','ai_executed')      | NOT NULL      |
| version             | INTEGER                           | NOT NULL      |
| updated_by          | UUID                              | FK→users.id   |
| created_at          | TIMESTAMPTZ                       | NOT NULL      |

INDEX: `(project_stage_id, version)`

<a id="question_templates-prompt_templates-quality_gate_items"></a>

### question_templates / prompt_templates / quality_gate_items（いずれも追記型・管理者編集用）

| カラム                             | 型               | 制約                                                                                                                                    |
| ------------------------------------ | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| id                                    | UUID              | PK                                                                                                                                          |
| organization_id                      | UUID              | NOT NULL, FK                                                                                                                                |
| stage_key                            | ENUM(7工程キー)   | NOT NULL                                                                                                                                    |
| questions / template_text / items    | JSONB or TEXT     | 内容本体。`questions`の各要素は`{id, text, order}`（例：`{"id":"q1","text":"...","order":1}`）。`items`の各要素は`{id, label, order}`      |
| version                              | INTEGER           | NOT NULL                                                                                                                                    |
| created_by                           | UUID              | FK→users.id                                                                                                                                 |
| created_at                           | TIMESTAMPTZ       | NOT NULL                                                                                                                                    |

UNIQUE: `(organization_id, stage_key, version)`

<a id="api_usage_logs"></a>

### api_usage_logs

| カラム                        | 型             | 制約                                       |
| ------------------------------- | --------------- | -------------------------------------------- |
| id                              | UUID            | PK                                            |
| organization_id                | UUID            | NOT NULL, FK                                  |
| project_stage_id               | UUID            | NULL可（工程に紐づかない呼び出しも想定）      |
| input_tokens / output_tokens   | INTEGER         |                                                |
| estimated_cost_usd             | NUMERIC(10,4)   |                                                |
| called_at                      | TIMESTAMPTZ     | NOT NULL                                      |

INDEX: `(organization_id, called_at)`
