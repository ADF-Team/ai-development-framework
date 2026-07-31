import * as repository from './repository'

// 公開テンプレート一覧を取得する
export function getPublishedTemplateList() {
  return repository.findPublishedTemplates()
}

// 公開テンプレートの詳細を取得する
export function getPublishedTemplateDetail(templateId: string) {
  return repository.findPublishedTemplateDetail(templateId)
}
