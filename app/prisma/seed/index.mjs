// ローカル開発用のシード実行エントリーポイント。テーブルごとのシード関数を依存順（organizations→users→templates→projects）に呼び出す
import { PrismaClient } from '@prisma/client'
import { seedOrganizations } from './data/organizations.mjs'
import { seedUsers } from './data/users.mjs'
import { seedTemplates } from './data/templates.mjs'
import { seedProjects } from './data/projects.mjs'

const prisma = new PrismaClient()

async function main() {
  const organizations = await seedOrganizations(prisma)
  const users = await seedUsers(prisma, organizations)
  const templates = await seedTemplates(prisma, { ...organizations, ...users })
  const projects = await seedProjects(prisma, {
    ...organizations,
    ...users,
    ...templates,
  })

  console.log('シード完了:')
  console.log({ organizations, users, templates, projects })
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
