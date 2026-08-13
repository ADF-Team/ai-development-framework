---
sidebar_position: 3
sidebar_label: PATCH /users/{id}
title: "PATCH /api/admin/users/{id}"
---

# `PATCH /api/admin/users/{id}`

<ApiEndpoint method="PATCH" path="/api/admin/users/{id}" />

ロール変更、またはアカウントの無効化／再有効化に使用する。アクセス者自身の組織に属するメンバーのみ操作可能（他組織のユーザーIDを指定した場合は、存在しない場合と同じ`404`を返す。組織をまたいだ存在有無を漏らさないため）。

## Request（例：無効化）

```json
{ "status": "disabled" }
```

## Response 200

レスポンスは更新後のメンバー情報全体（`GET /api/admin/users`の1件分と同じ形）。フロントエンドの一覧テーブルが、このレスポンスでその行を丸ごと差し替えるため。

```json
{ "id": "uuid", "email": "a@example.com", "role": "user", "status": "disabled", "displayName": "山田" }
```

## エラー

- `422`：リクエストボディが`updateUserSchema`のバリデーションに違反する場合。`role`・`status`のどちらも指定しない場合、`role`が`user`／`admin`以外（`system_admin`への変更もこのAPIではできない）、`status`が`active`／`disabled`以外のいずれか
- `404`：`id`に一致するメンバーが、アクセス者自身の組織内に存在しない場合

## 競合について

本APIに`409 Conflict`は存在しない。楽観ロック（バージョンチェック）は行われないため、2人の管理者が同時に同じメンバーの`role`／`status`を変更した場合、後から保存したリクエストの内容でそのまま上書きされる（last-write-wins）。

自分自身を無効化する、または自分の`role`を`admin`から`user`に変更するといった「自分自身の管理者権限を失わせる」操作を防ぐガードは無い（自分で自分にPATCHを送ると、そのままログイン不可・管理画面アクセス不可になり得る）。
