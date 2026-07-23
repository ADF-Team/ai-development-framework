---
sidebar_position: 2
sidebar_label: PUT /templates/{stageKey}
title: "PUT /api/admin/templates/{stageKey}"
---

# `PUT /api/admin/templates/{stageKey}`

<ApiEndpoint method="PUT" path="/api/admin/templates/{stageKey}" />

管理者ロールのみアクセス可（`403`：一般利用者がアクセスした場合）。新バージョンを追記する形で保存する。

## Request

[GET](./get-template.md)と同じ形式のボディを送信（`version`は不要。サーバー側で自動採番）

## Response 200

```json
{ "version": 4 }
```
