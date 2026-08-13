---
sidebar_position: 2
sidebar_label: POST /companies
title: "POST /api/system/companies"
---

# `POST /api/system/companies`

<ApiEndpoint method="POST" path="/api/system/companies" />

システム管理者ロールのみアクセス可。新しい会社（組織）を作成し、同時にその会社の初期管理者を招待する。

1. `organizations`レコードを作成（`status: active`）
2. 作成した`organization_id`に紐づく`users`レコードを作成（`role: admin`）
3. Identity Platform側にユーザーを作成し、招待メール（パスワード設定リンク付き）を送信する（既存の[`POST /api/admin/users`](../admin-users/invite-user.md)と同じ招待ロジックを、新規作成した組織に対して実行する）

## Request

```json
{
  "companyName": "株式会社サンプル",
  "adminEmail": "admin@example.com",
  "adminDisplayName": "山田太郎"
}
```

## Response 201

```json
{ "id": "uuid", "name": "株式会社サンプル", "status": "active" }
```

## エラー

- `422`：リクエストボディが`createCompanySchema`のバリデーションに違反する場合（`companyName`が空文字／256文字以上、`adminEmail`がメール形式でない、`adminDisplayName`が空文字／256文字以上）。このエンドポイントは、サーバー側バリデーションが実装済みの数少ないエンドポイントの1つ（もう1つは[`PATCH /api/system/companies/:id`](./update-company.md)。[リクエストボディのバリデーションについて](../index.md#リクエストボディのバリデーションについて)参照）。`detail`には最初に検知したバリデーションエラーのメッセージ（`src/constants/messages.ts`の`companyManagement.validation.*`）が入る
- `409`：以下のいずれか（`users.email`／`organizations.name`のユニーク制約違反をPrismaのP2002エラーとして検知し変換する。詳細は`src/lib/services/ServiceError.ts`の`mapPrismaError`）
  - 同一メールアドレス（`adminEmail`）が既に他の会社の初期管理者として使われている場合
  - 同一の会社名（`companyName`）が既に使われている場合（`detail`: `この会社名は既に使用されています。`。`organizations.name`はDBの一意制約で保証される）
- 上記1〜2（`organizations`／`users`レコードの作成）は`prisma.$transaction`で1トランザクションとして実行され、失敗時はロールバックする（会社だけ作成されて初期管理者が存在しない、という不整合な状態を防ぐ。詳細は`docs/README.md` C4「会社作成時の初期化ロジック」）。ただし2026-08時点ではステップ3（Identity Platform側のユーザー作成・招待メール送信）自体が未実装で、作成される`users`レコードの`identityPlatformUid`には`pending:<uuid>`というプレースホルダ値が入る（`src/app/api/system/companies/service.ts`の`registerCompany`参照）。そのため、作成された初期管理者は実際にはまだログインできない

[会社管理画面](../../screens/company-management.md)の`NewCompanyModal`から呼ばれる。
