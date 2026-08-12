import { getApps, initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth'
import {
  firebaseClientAuthEmulatorHost,
  firebaseClientConfig,
} from '@/config/env'

let auth: Auth | undefined

/**
 * Identity PlatformのクライアントSDKを初回呼び出し時に初期化する
 * （モジュール読み込み時に初期化すると、環境変数未設定時にSSRごとクラッシュするため遅延初期化にしている）
 */
export function getFirebaseAuth(): Auth {
  if (!auth) {
    const app = getApps()[0] ?? initializeApp(firebaseClientConfig)
    auth = getAuth(app)
    // NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOSTが設定されている場合はEmulatorに接続する
    if (firebaseClientAuthEmulatorHost) {
      connectAuthEmulator(auth, `http://${firebaseClientAuthEmulatorHost}`, {
        disableWarnings: true,
      })
    }
  }
  return auth
}
