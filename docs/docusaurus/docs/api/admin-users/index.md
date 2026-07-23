---
sidebar_position: 0
sidebar_label: 概要
title: 管理者：ユーザー
---

# 管理者：ユーザー

対応画面：[ユーザー管理画面](../../screens/admin-users.md)

**対応テーブル**：[`users`](../../db/tables.md#users)（`docs/README.md` C1）

管理者ロール（`role: admin`）のみアクセス可。

## エンドポイント一覧

- [`GET /api/admin/users`](./get-users.md)：組織内メンバー一覧取得
- [`POST /api/admin/users`](./invite-user.md)：メンバーを招待（メールアドレス・ロールを指定）
- [`PATCH /api/admin/users/:id`](./update-user.md)：ロール変更・アカウント無効化／再有効化
