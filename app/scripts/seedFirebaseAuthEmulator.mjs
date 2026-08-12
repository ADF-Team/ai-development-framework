// Firebase Auth Emulatorにテストユーザーを作成する（ローカル開発専用）
// prisma/seed/data/users.mjsで作成したPostgres側のsystem_adminユーザーと
// identityPlatformUid（uid）を一致させることで、ログイン後に正しくroleが引けるようにする
import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const TEST_USER = {
  uid: 'seed:system-admin',
  email: 'system-admin@example.com',
  password: 'password1234',
  displayName: 'シード システム管理者',
}

if (!process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  console.error(
    'FIREBASE_AUTH_EMULATOR_HOSTが未設定です。`npm run emulators:up`でEmulatorを起動してから実行してください。'
  )
  process.exit(1)
}

const app = initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID })
const auth = getAuth(app)

async function main() {
  try {
    await auth.createUser(TEST_USER)
  } catch (error) {
    if (error.code !== 'auth/uid-already-exists') throw error
    await auth.updateUser(TEST_USER.uid, {
      email: TEST_USER.email,
      password: TEST_USER.password,
      displayName: TEST_USER.displayName,
    })
  }

  console.log('Emulatorにテストユーザーを作成しました:')
  console.log(`  メールアドレス: ${TEST_USER.email}`)
  console.log(`  パスワード: ${TEST_USER.password}`)
}

main()
