// ローカル開発用のシード実行エントリーポイント。テーブルごとのシード関数を依存順（organizations→users）に呼び出す
import { PrismaClient } from '@prisma/client'
import { seedOrganizations } from './data/organizations.mjs'
import { seedUsers } from './data/users.mjs'

const prisma = new PrismaClient()

async function main() {
  const organizations = await seedOrganizations(prisma)
  const users = await seedUsers(prisma, organizations)

  console.log('シード完了:')
  console.log({ organizations, users })
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
