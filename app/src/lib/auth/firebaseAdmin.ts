import { cert, getApps, initializeApp, type App } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { firebaseAdminConfig } from '@/config/env'

let app: App | undefined

// Firebase Admin Appのシングルトンを初回呼び出し時に生成する
function getFirebaseAdminApp(): App {
  if (!app) {
    app =
      getApps()[0] ??
      initializeApp({
        credential: cert(firebaseAdminConfig),
      })
  }
  return app
}

/**
 * Firebase Admin SDKを初回呼び出し時に初期化する
 * （モジュール読み込み時に初期化すると、環境変数未設定時にクラッシュするため遅延初期化にしている）
 */
export function getFirebaseAdminAuth(): Auth {
  return getAuth(getFirebaseAdminApp())
}
