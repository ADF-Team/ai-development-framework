import type { Organization, UserRole } from '@prisma/client'
import { prisma } from '@/lib/api/prisma'
import { withPrismaErrorMapping } from '@/lib/services/ServiceError'
import type { CompanyListItem, CompanyStatus } from '@/types/Company'

// PrismaのOrganizationレコードを画面表示用のCompanyListItemに変換する
function toCompanyListItem(organization: Organization): CompanyListItem {
  return {
    id: organization.id,
    name: organization.name,
    status: organization.status,
    createdAt: organization.createdAt.toISOString().slice(0, 10),
  }
}

// 会社（組織）一覧を取得する
export async function findCompanies(): Promise<CompanyListItem[]> {
  const organizations = await withPrismaErrorMapping(() =>
    prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
    })
  )
  return organizations.map(toCompanyListItem)
}

// 会社と初期管理者ユーザーを1トランザクションで作成する
// （docs/docusaurus/docs/api/system-companies/create-company.md参照。Identity Platform側のユーザー作成・招待メール送信は別途実装する）
export async function insertCompanyWithAdmin(payload: {
  companyName: string
  admin: {
    identityPlatformUid: string
    email: string
    displayName: string
    role: UserRole
  }
}): Promise<CompanyListItem> {
  const organization = await withPrismaErrorMapping(() =>
    prisma.$transaction(async (tx) => {
      const created = await tx.organization.create({
        data: { name: payload.companyName },
      })
      await tx.user.create({
        data: {
          organizationId: created.id,
          identityPlatformUid: payload.admin.identityPlatformUid,
          email: payload.admin.email,
          displayName: payload.admin.displayName,
          role: payload.admin.role,
        },
      })
      return created
    })
  )
  return toCompanyListItem(organization)
}

// 会社名の変更、または有効化／無効化を保存する
export async function saveCompany(
  id: string,
  payload: { name?: string; status?: CompanyStatus }
): Promise<CompanyListItem> {
  const organization = await withPrismaErrorMapping(() =>
    prisma.organization.update({
      where: { id },
      data: {
        ...(payload.name ? { name: payload.name } : {}),
        ...(payload.status ? { status: payload.status } : {}),
      },
    })
  )
  return toCompanyListItem(organization)
}
