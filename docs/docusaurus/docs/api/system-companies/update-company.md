---
sidebar_position: 3
sidebar_label: PATCH /companies/{id}
title: "PATCH /api/system/companies/{id}"
---

# `PATCH /api/system/companies/{id}`

<ApiEndpoint method="PATCH" path="/api/system/companies/{id}" />

システム管理者ロールのみアクセス可。会社名の変更、または有効化／無効化に使用する。無効化（`status: suspended`）すると、この会社に属する全ユーザーがログイン不可になる（`users.status`は変更しない。ログイン時に所属組織の`status`もあわせてチェックする）。

## Request（例：無効化）

```json
{ "status": "suspended" }
```

## Response 200

```json
{ "id": "uuid", "status": "suspended" }
```

## エラー

- `422`：リクエストボディが`updateCompanySchema`のバリデーションに違反する場合。`name`・`status`のどちらも指定しない（空オブジェクトを送る等）場合も含む。このエンドポイントは、[`POST /api/system/companies`](./create-company.md)と並んでサーバー側バリデーションが実装済み（[リクエストボディのバリデーションについて](../index.md#リクエストボディのバリデーションについて)参照）
  - `name`を指定する場合：空文字／256文字以上は不可
  - `status`を指定する場合：`active`／`suspended`以外の値は不可
  - `detail`には最初に検知したバリデーションエラーのメッセージ（`src/constants/messages.ts`の`companyManagement.validation.*`）が入る
- `404`：`id`に一致する会社が存在しない場合
- `409`：`name`を変更する場合、変更後の会社名が既に他の会社で使われている場合（`detail`: `この会社名は既に使用されています。`。`organizations.name`のDB一意制約違反をPrismaのP2002エラーとして検知し変換する）

楽観ロック（バージョンチェック）は行われないため、同じ会社の`name`／`status`を2人が同時に更新した場合は last-write-wins になる（`409`が発生するのは上記の会社名重複ケースのみ）。

[会社管理画面](../../screens/company-management.md)の`CompanyCard`（名称編集）・`SuspendCompanyModal`（無効化確認）から呼ばれる。
