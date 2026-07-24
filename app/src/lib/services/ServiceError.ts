// lib/services配下の各モックサービスが投げる共通エラー。API RouteはhandleServiceErrorでレスポンスJSONに変換する
export class ServiceError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}
