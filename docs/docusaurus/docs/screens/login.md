---
sidebar_position: 1
title: ログイン画面
---

# ログイン画面

- **URL**: `/login`
- **画面ファイル**: `app/src/app/(auth)/login/page.tsx`
- **コンポーネント**: `app/src/features/auth/components/LoginScreen.tsx`

## 概要

Identity Platform（Firebase Auth）のクライアント側SDKでメールアドレス／パスワードによるログインを行う画面。セルフサインアップは無効で、管理者が事前に招待したユーザーのみログインできる（[ユーザー管理画面](./admin-users.md)参照）。

## 主要コンポーネント

`docs/adf-design.md` C3を参照。

| コンポーネント        | 役割                                                                       |
| ---------------------- | --------------------------------------------------------------------------- |
| `LoginForm`            | メール／パスワード入力、Identity Platform SDKの`signIn`呼び出し           |
| `ForgotPasswordLink`   | パスワードリセットのメール送信フローへの導線                              |
| `ErrorMessage`         | 認証エラー時のメッセージ表示                                              |

## 認証フロー

ログイン成功後、IDトークンをそのまま使い回さず、サーバー側でセッションCookieに変換して保存する。詳細は`CLAUDE.md`の「認証（セッションCookie）」を参照。

```
1. クライアント：Identity Platform SDKでログイン → IDトークン取得
2. クライアント → POST /api/auth/session （IDトークンを送る）
3. サーバー：IDトークンを検証 → createSessionCookie() → Set-Cookie（httpOnly, 'session'）
4. ログイン後は /projects（案件一覧画面）へ遷移
```

パスワードリセットはIdentity Platform標準のメールリンク方式を利用する（独自実装しない）。

## 補足

- 未ログイン状態で保護ルート（`/projects/*`, `/admin/*`）にアクセスした場合、`middleware.ts`により本画面へリダイレクトされる
- 管理者ロールの判定はmiddlewareでは行わない（`app/(dashboard)/admin/layout.tsx`で判定）
