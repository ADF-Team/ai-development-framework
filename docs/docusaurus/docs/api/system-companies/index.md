---
sidebar_position: 0
sidebar_label: 概要
title: システム管理者：会社
---

# システム管理者：会社

対応画面：[会社管理画面](../../screens/company-management.md)

**対応テーブル**：[`organizations`](../../db/tables.md#organizations)（`docs/README.md` C1）

システム管理者ロール（`role: system_admin`）のみアクセス可（`403`：管理者・利用者がアクセスした場合）。システム管理者は自組織以外の会社（組織）のメタ情報（会社名・有効／無効化ステータス）のみ管理でき、他社の案件・テンプレート・ユーザーの中身は見られない。

## エンドポイント一覧

- [`GET /api/system/companies`](./list-companies.md)：会社（組織）一覧取得
- [`POST /api/system/companies`](./create-company.md)：会社を作成（会社名＋初期管理者のメールアドレスを指定。作成と同時に初期管理者を招待）
- [`PATCH /api/system/companies/:id`](./update-company.md)：会社名の変更・有効化／無効化
