---
sidebar_position: 0
sidebar_label: 概要
title: 認証
---

# 認証

対応画面：[ログイン画面](../../screens/login.md)

Identity Platform（Firebase Auth）のIDトークンをサーバー側のセッションCookie（httpOnly、Cookie名`session`）に変換・破棄するエンドポイント。ロール等による制限はなく、ログイン済みかどうかのみが関係する。

このセクションのエンドポイントは、[全エンドポイント共通の認証チェック](../index.md#認証)の対象外（`getCurrentUser()`／`requireSystemAdmin()`を呼ばない）。`POST`はこれからセッションを発行するためのエンドポイント、`DELETE`は未ログインで呼んでもCookie削除自体は成功するため。

## エンドポイント一覧

- [`POST /api/auth/session`](./login-session.md)：IDトークンを検証し、セッションCookieを発行する（ログイン）
- [`DELETE /api/auth/session`](./logout-session.md)：セッションCookieを削除する（ログアウト）
