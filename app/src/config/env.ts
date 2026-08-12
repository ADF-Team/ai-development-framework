export const APP_URL = process.env.APP_URL as string

export const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID as string,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string,
  privateKey: (process.env.FIREBASE_PRIVATE_KEY as string)?.replace(
    /\\n/g,
    '\n'
  ),
}

export const firebaseClientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
}

// 設定されている場合、Firebase Admin SDKはFirebase Auth Emulatorに接続する（ローカル開発用）
export const firebaseAuthEmulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST

// 設定されている場合、Identity Platformのクライアント側SDKはFirebase Auth Emulatorに接続する（ローカル開発用）
export const firebaseClientAuthEmulatorHost =
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST

export const SESSION_COOKIE_NAME = 'session'
export const SESSION_EXPIRES_IN_MS = 1000 * 60 * 60 * 24 * 14
