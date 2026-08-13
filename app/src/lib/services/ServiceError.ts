import { Prisma } from '@prisma/client'
import { messages } from '@/constants/messages'
import { ERROR_STATUS } from '@/constants/response'

// service/repository層が投げる共通エラー。API RouteはhandleServiceErrorでレスポンスJSONに変換する
export class ServiceError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

// P2002（一意制約違反）の対象列ごとの詳細メッセージ。未登録の列は汎用メッセージにフォールバックする
const UNIQUE_CONSTRAINT_MESSAGES: Partial<Record<string, string>> = {
  email: messages.common.errorMessage.emailConflict,
  name: messages.companyManagement.validation.nameDuplicate,
  title: messages.adminTemplates.validation.titleDuplicate,
}

// P2002（一意制約違反）発生時に、違反した列に応じて詳細なメッセージを返す
function mapUniqueConstraintError(
  error: Prisma.PrismaClientKnownRequestError
): ServiceError {
  const target = error.meta?.target
  const columns = Array.isArray(target) ? target : []
  const message = columns
    .map((column) => UNIQUE_CONSTRAINT_MESSAGES[column])
    .find((candidate): candidate is string => candidate !== undefined)

  return new ServiceError(
    ERROR_STATUS.CONFLICT,
    message ?? messages.common.errorMessage.conflict
  )
}

// PrismaのエラーをServiceErrorに変換する。マッピング対象外のエラーはnullを返す（呼び出し元でそのままthrowする）
export function mapPrismaError(error: unknown): ServiceError | null {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return null

  switch (error.code) {
    case 'P2002':
      return mapUniqueConstraintError(error)
    case 'P2025':
      return new ServiceError(
        ERROR_STATUS.NOT_FOUND,
        messages.common.errorMessage.notFound
      )
    case 'P2023':
      // idの型不一致等、不正な形式の値が渡された場合（例：UUID列に不正な文字列）
      return new ServiceError(
        ERROR_STATUS.UNPROCESSABLE_ENTITY,
        messages.common.errorMessage.unprocessableEntity
      )
    default:
      return null
  }
}

// Prismaを使ったDB操作を実行し、発生したエラーをmapPrismaErrorでServiceErrorへ変換する
export async function withPrismaErrorMapping<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    throw mapPrismaError(error) ?? error
  }
}
