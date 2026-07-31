import {
  listPublishedTemplates,
  getPublishedTemplateDetail,
} from '@/lib/services/templates'

// TODO: インフラ（Cloud SQL）準備後、Prisma経由でDBアクセスする実装に置き換える（現状はlib/services/templatesのモックストアを参照する）

// 公開中テンプレートの一覧を取得する
export function findPublishedTemplates() {
  return listPublishedTemplates()
}

// 公開テンプレートの詳細（現在有効な版の7工程分の内容）を取得する
export function findPublishedTemplateDetail(templateId: string) {
  return getPublishedTemplateDetail(templateId)
}
