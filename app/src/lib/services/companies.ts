import { messages } from '@/constants/messages'
import { ServiceError } from './ServiceError'
import type { CompanyListItem, CompanyStatus } from '@/types/Company'

// TODO: インフラ（Cloud SQL）準備後、Prisma経由でDBアクセスする実装に置き換える。
// 現状はプロセス内メモリのモックストアで会社（組織）を保持する。
const COMPANIES = new Map<string, CompanyListItem>([
  [
    'c1',
    {
      id: 'c1',
      name: '株式会社サンプル',
      status: 'active',
      createdAt: '2026-01-10',
    },
  ],
  [
    'c2',
    {
      id: 'c2',
      name: '株式会社ベータ',
      status: 'active',
      createdAt: '2026-04-02',
    },
  ],
  [
    'c3',
    {
      id: 'c3',
      name: 'テスト商事株式会社',
      status: 'suspended',
      createdAt: '2026-06-15',
    },
  ],
])

// 会社作成時に初期管理者として使われたメールアドレス（重複作成防止用のモック）
const ADMIN_EMAILS = new Set<string>()

function findCompanyOrThrow(id: string): CompanyListItem {
  const company = COMPANIES.get(id)
  if (!company) {
    throw new ServiceError(404, messages.common.errorMessage.notFound)
  }
  return company
}

/**
 * 会社（組織）一覧を取得する（会社管理画面用）
 */
export function listCompanies(): CompanyListItem[] {
  return Array.from(COMPANIES.values())
}

/**
 * 会社を作成し、同時に初期管理者を招待する（Identity Platform側のユーザー作成・招待メール送信は別途行う想定）
 * @param payload - 会社名・初期管理者のメールアドレス・表示名
 */
export function createCompany(payload: {
  companyName: string
  adminEmail: string
  adminDisplayName: string
}): CompanyListItem {
  if (ADMIN_EMAILS.has(payload.adminEmail)) {
    throw new ServiceError(409, messages.common.errorMessage.conflict)
  }

  const id = `c${Date.now()}`
  const company: CompanyListItem = {
    id,
    name: payload.companyName,
    status: 'active',
    createdAt: new Date().toISOString().slice(0, 10),
  }
  COMPANIES.set(id, company)
  ADMIN_EMAILS.add(payload.adminEmail)

  return company
}

/**
 * 会社名の変更、または有効化／無効化を行う
 * @param id - 対象の会社ID
 * @param payload - 変更後の会社名またはステータス
 */
export function updateCompany(
  id: string,
  payload: { name?: string; status?: CompanyStatus }
): CompanyListItem {
  const company = findCompanyOrThrow(id)
  const updated: CompanyListItem = {
    ...company,
    ...(payload.name ? { name: payload.name } : {}),
    ...(payload.status ? { status: payload.status } : {}),
  }
  COMPANIES.set(id, updated)
  return updated
}
