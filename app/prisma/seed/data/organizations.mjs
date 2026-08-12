// 会社（組織）のシードデータを作成する
export async function seedOrganizations(prisma) {
  const seedCompany = await prisma.organization.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'シード会社',
    },
  })

  return { seedCompany }
}
