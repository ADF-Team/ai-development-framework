// Template関連のPrismaアクセスは`admin/templates/repository.ts`に集約されている（同じテーブルを
// 「管理者用（自組織の全テンプレート）」「全ユーザー用（公開中のみ）」の2つの見え方で提供するリソースのため）。
export {
  findPublishedTemplateSummaries as findPublishedTemplates,
  findPublishedTemplateDetail,
} from '../../admin/templates/repository'
