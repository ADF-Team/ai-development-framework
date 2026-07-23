---
sidebar_position: 1
title: DB
---

# DB

[API](../api/index.md)の設計（`docs/README.md` B6/C2）から導かれたテーブル構成。詳細なカラム定義は[テーブル定義](./tables.md)を参照。まだ実装はなく、実装しながら見直される想定（`docs/README.md` B7）。

版管理が必要なテーブル（`deliverables` / `question_templates` / `prompt_templates` / `quality_gate_items`）は、更新のたびに新しい行を追加する**追記型（Append-only）**とし、`version`の最大値が「現在有効な版」となる設計にする。

## ER図

```mermaid
erDiagram
    ORGANIZATIONS ||--o{ USERS : has
    ORGANIZATIONS ||--o{ PROJECTS : has
    ORGANIZATIONS ||--o{ QUESTION_TEMPLATES : has
    ORGANIZATIONS ||--o{ PROMPT_TEMPLATES : has
    ORGANIZATIONS ||--o{ QUALITY_GATE_ITEMS : has
    ORGANIZATIONS ||--o{ API_USAGE_LOGS : has

    USERS ||--o{ PROJECTS : creates
    USERS ||--o{ DELIVERABLES : updates
    USERS ||--o{ QUESTION_TEMPLATES : creates
    USERS ||--o{ PROMPT_TEMPLATES : creates
    USERS ||--o{ QUALITY_GATE_ITEMS : creates

    PROJECTS ||--o{ PROJECT_STAGES : has
    PROJECT_STAGES ||--o{ DELIVERABLES : has
    PROJECT_STAGES |o--o{ API_USAGE_LOGS : "may relate to"

    ORGANIZATIONS {
        uuid id PK
        string name
        timestamptz created_at
    }
    USERS {
        uuid id PK
        uuid organization_id FK
        string identity_platform_uid
        string email
        enum role
        string display_name
        enum status
        timestamptz created_at
    }
    PROJECTS {
        uuid id PK
        uuid organization_id FK
        string name
        enum current_stage
        enum overall_status
        uuid created_by FK
        timestamptz created_at
        timestamptz updated_at
    }
    PROJECT_STAGES {
        uuid id PK
        uuid project_id FK
        enum stage_key
        enum status
        jsonb answers
        text generated_prompt
        jsonb quality_gate_result
        timestamptz completed_at
    }
    DELIVERABLES {
        uuid id PK
        uuid project_stage_id FK
        text content
        enum generation_method
        int version
        uuid updated_by FK
        timestamptz created_at
    }
    QUESTION_TEMPLATES {
        uuid id PK
        uuid organization_id FK
        enum stage_key
        jsonb questions
        int version
        uuid created_by FK
        timestamptz created_at
    }
    PROMPT_TEMPLATES {
        uuid id PK
        uuid organization_id FK
        enum stage_key
        text template_text
        int version
        uuid created_by FK
        timestamptz created_at
    }
    QUALITY_GATE_ITEMS {
        uuid id PK
        uuid organization_id FK
        enum stage_key
        jsonb items
        int version
        uuid created_by FK
        timestamptz created_at
    }
    API_USAGE_LOGS {
        uuid id PK
        uuid organization_id FK
        uuid project_stage_id FK
        int input_tokens
        int output_tokens
        numeric estimated_cost_usd
        timestamptz called_at
    }
```
