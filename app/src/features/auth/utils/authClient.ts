import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { getFirebaseAuth } from '@/lib/auth/firebaseClient'

export type SignInResult = 'success' | 'invalid-credentials' | 'error'

const INVALID_CREDENTIAL_CODES = [
  'auth/invalid-credential',
  'auth/wrong-password',
  'auth/user-not-found',
]

/**
 * Identity Platform SDKでログインし、セッションCookieを発行する
 * @param email - メールアドレス
 * @param password - パスワード
 */
export async function signIn(
  email: string,
  password: string
): Promise<SignInResult> {
  try {
    const credential = await signInWithEmailAndPassword(
      getFirebaseAuth(),
      email,
      password
    )
    const idToken = await credential.user.getIdToken()

    const response = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    })

    if (!response.ok) {
      // セッションCookieの発行に失敗した場合、Firebase側にも認証済み状態を残さない
      await signOut(getFirebaseAuth())
      return 'error'
    }

    return 'success'
  } catch (error) {
    if (
      error instanceof FirebaseError &&
      INVALID_CREDENTIAL_CODES.includes(error.code)
    ) {
      return 'invalid-credentials'
    }
    return 'error'
  }
}

export type ResetPasswordResult = 'sent' | 'error'

/**
 * Identity Platform標準のパスワードリセットメールを送信する
 * @param email - メールアドレス
 */
export async function sendResetPasswordEmail(
  email: string
): Promise<ResetPasswordResult> {
  try {
    await sendPasswordResetEmail(getFirebaseAuth(), email)
    return 'sent'
  } catch {
    return 'error'
  }
}
