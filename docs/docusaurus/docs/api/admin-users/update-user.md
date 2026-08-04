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

## エラー

- `404`：`id`に一致するメンバーが存在しない場合

## 競合について

本APIに`409 Conflict`は存在しない。楽観ロック（バージョンチェック）は行われないため、2人の管理者が同時に同じメンバーの`role`／`status`を変更した場合、後から保存したリクエストの内容でそのまま上書きされる（last-write-wins）。
