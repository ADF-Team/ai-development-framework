---
sidebar_position: 3
sidebar_label: PATCH /users/{id}
title: "PATCH /api/admin/users/{id}"
---

# `PATCH /api/admin/users/{id}`

<ApiEndpoint method="PATCH" path="/api/admin/users/{id}" />

ロール変更、またはアカウントの無効化／再有効化に使用する。

## Request（例：無効化）

```json
{ "status": "disabled" }
```

## Response 200

```json
{ "id": "uuid", "status": "disabled" }
```
