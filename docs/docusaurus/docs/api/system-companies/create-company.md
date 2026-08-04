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

- `422`：リクエストボディが`createCompanySchema`のバリデーションに違反する場合（`companyName`が空文字／256文字以上、`adminEmail`がメール形式でない、`adminDisplayName`が空文字／256文字以上）。このエンドポイントは、本ドキュメント配下で唯一サーバー側バリデーションが実装済み（[リクエストボディのバリデーションについて](../index.md#リクエストボディのバリデーションについて)参照）。`detail`には最初に検知したバリデーションエラーのメッセージ（`src/constants/messages.ts`の`companyManagement.validation.*`）が入る
- `409`：同一メールアドレス（`adminEmail`）が既に他の会社の初期管理者として使われている場合
- 上記2〜3のいずれかが失敗した場合はロールバックする設計（会社だけ作成されて初期管理者が存在しない、という不整合な状態を防ぐ。詳細は`docs/README.md` C4「会社作成時の初期化ロジック」）。ただし2026-08時点ではIdentity Platform連携自体が未実装（`createCompany`はメモリ上のモックストアを同期的に更新するのみ）のため、実際にロールバックが発生する経路はまだ存在しない

[会社管理画面](../../screens/company-management.md)の`NewCompanyModal`から呼ばれる。
