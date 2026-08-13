---
sidebar_position: 0
sidebar_label: 概要
title: 管理者：ユーザー
---

# 管理者：ユーザー

対応画面：[ユーザー管理画面](../../screens/admin-users.md)

**対応テーブル**：[`users`](../../db/tables.md#users)（`docs/README.md` C1）

`role`が`admin`または`system_admin`のユーザーのみアクセス可（`requireAdmin()`。403：それ以外のロールがアクセスした場合）。常にアクセス者自身の`organization_id`にスコープされ、他組織のメンバーは一覧に出てこない・IDを直接指定しても操作できない（存在しない場合と同じ`404`）。

**2026-08時点で、実際にPrisma経由でDBアクセスするよう実装されているのは[認証](../auth/index.md)・[システム管理者：会社](../system-companies/index.md)と、このセクションの3つのみ**。他のリソース（案件・工程・テンプレート等）は引き続きモック実装（[全エンドポイント共通の認証チェック](../index.md#認証)参照）。

## エンドポイント一覧

- [`GET /api/admin/users`](./get-users.md)：組織内メンバー一覧取得
- [`POST /api/admin/users`](./invite-user.md)：メンバーを招待（メールアドレス・ロールを指定）
- [`PATCH /api/admin/users/:id`](./update-user.md)：ロール変更・アカウント無効化／再有効化
