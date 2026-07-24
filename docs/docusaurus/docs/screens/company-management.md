---
sidebar_position: 9
title: 会社管理画面
---

# 会社管理画面（システム管理者用）

- **URL**: `/system/companies`
- **画面ファイル**: `app/src/app/(auth)/system/companies/page.tsx`
- **コンポーネント**: `app/src/features/system-companies/components/CompanyManagementScreen.tsx`

## 概要

システム管理者が会社（組織）の作成・編集・無効化を行う画面。システム管理者ロール（`role: system_admin`）のみアクセス可能。`AppSidebar`の「システム管理」グループはシステム管理者ロールでログインした場合のみ表示される（管理者・利用者には表示されない。`docs/README.md` C3参照）。

システム管理者は会社のメタ情報（会社名・有効／無効化ステータス）のみ管理でき、他社の案件・テンプレート・ユーザーの中身は見られない。v1では自社（最初の1組織）の運用者がシステム管理者を兼ねる想定で、将来の他社ライセンス提供（Phase3）を見据えたロール。

最初の会社と最初のシステム管理者アカウントはこの画面のUIを介さず、デプロイ時のシードスクリプトまたはIdentity Platformコンソールから直接作成する（`docs/README.md` B3）。2社目以降はこの画面から作成する。

## 主要コンポーネント

`docs/README.md` C3を参照。

| コンポーネント          | 役割                                                                                      |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| `CompanyCard`            | 会社名／ステータス（有効／無効）／作成日。クリックで会社名編集・有効化／無効化の操作ができる |
| `NewCompanyModal`        | 会社名の入力欄（255文字まで）、初期管理者のメールアドレス・表示名の入力欄。作成と同時に初期管理者へ招待メールが送信される |
| `SuspendCompanyModal`    | 無効化ボタン押下時に表示。「この会社に属する全ユーザーがログインできなくなりますがよいですか」の確認メッセージと、続行／キャンセルボタン |

## 使用API

| API                                                                       | 用途                                     |
| ---------------------------------------------------------------------------- | ------------------------------------------ |
| [`GET /api/system/companies`](../api/system-companies/list-companies.md)     | 会社（組織）一覧取得                       |
| [`POST /api/system/companies`](../api/system-companies/create-company.md)    | 会社を作成（会社名＋初期管理者を同時招待） |
| [`PATCH /api/system/companies/:id`](../api/system-companies/update-company.md) | 会社名の変更・有効化／無効化               |

## 画面構成

見出し右側の「新規作成」ボタンから`NewCompanyModal`を開いて会社を作成できる。作成すると[`POST /api/system/companies`](../api/system-companies/create-company.md)が呼ばれ、`organizations`レコードの作成と、指定した初期管理者（`role: admin`）への招待メール送信がまとめて行われる（既存の[メンバー招待](../api/admin-users/invite-user.md)と同じ招待ロジックを、新規作成した組織に対して実行する）。作成の途中で失敗した場合はロールバックされ、会社だけが作成されて初期管理者が存在しない、という不整合な状態にはならない。

`CompanyCard`をクリックすると会社名の編集ができる（インライン編集、[`PATCH /api/system/companies/:id`](../api/system-companies/update-company.md)で保存）。カード上の無効化ボタンを押すと`SuspendCompanyModal`が開き、続行すると`status: suspended`で更新される。無効化した会社に属するユーザーは、`users.status`が`active`のままでもログインできなくなる（ログイン時に所属組織の`status`もあわせてチェックするため。`docs/README.md` C4「ログイン時の組織ステータスチェック」参照）。再度「有効化」ボタンで`status: active`に戻せる。
