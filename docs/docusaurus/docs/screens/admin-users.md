---
sidebar_position: 5
title: ユーザー管理画面
---

# ユーザー管理画面（管理者用）

- **URL**: `/admin/users`
- **画面ファイル**: `app/src/app/(dashboard)/admin/users/page.tsx`
- **コンポーネント**: `app/src/features/admin-users/components/UserManagementScreen.tsx`

## 概要

管理者が組織内メンバーを招待し、ロール（利用者／管理者）の設定・アカウントの無効化を行う画面。管理者ロール（`role: admin`）のみアクセス可能。

セルフサインアップは無効。招待メールには本人がパスワードを設定するためのリンクを含める（管理者がパスワードを決めて渡すことはしない）。退職者等のアカウントは削除ではなく無効化する（データの整合性・成果物の紐付けを保持するため）。

## 主要コンポーネント

`docs/README.md` C3を参照。

| コンポーネント      | 役割                                 |
| ------------------- | ------------------------------------ |
| `UserListTable`     | メンバー一覧。ロール・ステータス表示 |
| `InviteUserModal`   | メールアドレス・ロールを指定して招待 |
| `RoleSelect`        | ロール変更                           |
| `DisableUserButton` | アカウント無効化／再有効化           |

## 使用API

| API                                                               | 用途                                           |
| ----------------------------------------------------------------- | ---------------------------------------------- |
| [`GET /api/admin/users`](../api/admin-users/get-users.md)         | 組織内メンバー一覧取得                         |
| [`POST /api/admin/users`](../api/admin-users/invite-user.md)      | メンバーを招待（メールアドレス・ロールを指定） |
| [`PATCH /api/admin/users/:id`](../api/admin-users/update-user.md) | ロール変更・アカウント無効化／再有効化         |
