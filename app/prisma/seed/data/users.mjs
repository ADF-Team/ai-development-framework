// ユーザーのシードデータを作成する（会社管理APIの動作確認用にsystem_adminロールを1件作成する）
// 実際のFirebase Authは使わず、identityPlatformUidにダミー値を入れる（DB直接シードでのAPI動作確認用）
export async function seedUsers(prisma, { seedCompany }) {
  const systemAdmin = await prisma.user.upsert({
    where: { email: 'system-admin@example.com' },
    update: {},
    create: {
      organizationId: seedCompany.id,
      identityPlatformUid: 'seed:system-admin',
      email: 'system-admin@example.com',
      displayName: 'シード システム管理者',
      role: 'system_admin',
    },
  })

  return { systemAdmin }
}
