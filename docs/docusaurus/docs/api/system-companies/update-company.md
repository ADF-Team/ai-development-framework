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

[会社管理画面](../../screens/company-management.md)の`CompanyCard`（名称編集）・`SuspendCompanyModal`（無効化確認）から呼ばれる。
