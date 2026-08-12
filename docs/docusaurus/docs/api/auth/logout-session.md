---
sidebar_position: 2
sidebar_label: DELETE /session
title: "DELETE /api/auth/session"
---

# `DELETE /api/auth/session`

<ApiEndpoint method="DELETE" path="/api/auth/session" />

セッションCookieを削除する（ログアウト）。認証チェックは行わない（未ログイン状態、または既に無効なCookieで呼んでも`204`を返す）。

## Request

ボディなし。

## Response 204

ボディなし。`session`Cookieを削除する。

共通サイドバー（`AppSidebar`）のログアウトボタンから、`src/features/auth/utils/authClient.ts`の`signOutUser()`経由で呼ばれる。ログインの`POST`と同様、`src/lib/frontend/apiClient`のServer Action経由ではなく、クライアントコンポーネントから直接`fetch`する（Firebase Auth SDKの`signOut()`とセットで呼ぶ必要があるための例外）。
