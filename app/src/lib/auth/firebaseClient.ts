import { getApps, initializeApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { firebaseClientConfig } from '@/config/env'

let auth: Auth | undefined

/**
 * Identity PlatformのクライアントSDKを初回呼び出し時に初期化する
 * （モジュール読み込み時に初期化すると、環境変数未設定時にSSRごとクラッシュするため遅延初期化にしている）
 */
export function getFirebaseAuth(): Auth {
  if (!auth) {
    const app = getApps()[0] ?? initializeApp(firebaseClientConfig)
    auth = getAuth(app)
  }
  return auth
}
