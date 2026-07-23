# CLAUDE.md

このファイルは、このリポジトリでClaude Codeが実装作業を行う際に必ず参照するプロジェクトルールです。

## プロジェクト概要

AI Development Framework（ADF）のWebアプリ実装。詳細な要件・API・DB設計は `docs/README.md`（設計ドキュメント v1.1）を正とする。機能追加・仕様確認が必要な場合は、まずこのファイルを参照すること。

## 技術スタック

| 領域           | 選定                               |
| -------------- | ---------------------------------- |
| フレームワーク | Next.js（App Router）              |
| UIライブラリ   | shadcn/ui                          |
| CSS            | Tailwind CSS                       |
| アイコン       | lucide-react                       |
| 状態管理       | jotai                              |
| DB             | PostgreSQL（Cloud SQL）            |
| ORM            | Prisma                             |
| 認証           | Identity Platform（Firebase Auth） |
| AI API         | Anthropic Claude API               |
| デプロイ       | Cloud Run                          |

---

## 絶対に守ること

1. **デザイン通りに実装する**。Claude Design/Figmaのモックアップにない挙動・レイアウトを勝手に補って実装しない。判断に迷うケース（モックアップに存在しない状態やエッジケース）は、実装を止めて確認する
2. **TypeScriptを厳守する**。`any`を使わない。`tsconfig.json`は`strict: true`。型は推論に頼りすぎず、関数の引数・戻り値は明示する
3. **色は`global.css`に定義したCSS変数からのみ使う**。コンポーネント内でのハードコードされた色指定（`text-[#1E2761]`のような直書き）は禁止。Tailwindのテーマ拡張経由で参照する
4. **アイコンは`lucide-react`のみ**使用する
5. **画面に表示する日本語文字列は、すべて`src/constants/messages.ts`にオブジェクトとして定義する**。コンポーネント内に直接日本語を書かない
6. テストは現時点では書かない（v1は実装速度を優先。後日追加する）

---

## ディレクトリ構成

feature-basedの構成を採用する。Next.js App Routerの`app/`はルーティング専用の特殊フォルダのため、bulletproof-react準拠の構成を以下のように読み替える。

```
src
├── app/                      # Next.js App Router（ルーティング専用。page.tsx/layout.tsx/route.tsのみ）
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (dashboard)/
│   │   ├── projects/
│   │   │   ├── page.tsx              # 案件一覧
│   │   │   └── [projectId]/page.tsx  # 案件詳細（工程別ワークスペース）
│   │   └── admin/
│   │       ├── templates/
│   │       │   ├── page.tsx
│   │       │   └── [stageKey]/page.tsx
│   │       └── users/page.tsx
│   ├── api/                  # API Routes（docs/adf-design.md の B6/C2 と1対1対応させる）
│   │   ├── projects/route.ts
│   │   ├── projects/[id]/route.ts
│   │   ├── projects/[id]/stages/[stageKey]/route.ts
│   │   ├── projects/[id]/stages/[stageKey]/answers/route.ts
│   │   ├── projects/[id]/stages/[stageKey]/generate-prompt/route.ts
│   │   ├── projects/[id]/stages/[stageKey]/execute/route.ts
│   │   ├── projects/[id]/stages/[stageKey]/deliverable/route.ts
│   │   ├── projects/[id]/stages/[stageKey]/quality-gate/route.ts
│   │   ├── admin/templates/[stageKey]/route.ts
│   │   ├── admin/users/route.ts
│   │   └── admin/users/[id]/route.ts
│   ├── layout.tsx
│   └── provider.tsx          # jotaiのProvider、sonnerの<Toaster />等、グローバルプロバイダをまとめる
│
├── components/                # ui/（shadcn生成物）＋ table/ card/ button/ 等の種類別フォルダ（詳細は「コンポーネント設計方針」）
├── config/                    # 環境変数のエクスポート、定数
├── constants/                  # messages.ts（日本語文字列）、response.ts（HTTPステータス定数）
├── features/                  # 機能単位のモジュール（下記「features一覧」参照）
├── hooks/                     # 複数featureで使う共有hooks
├── lib/
│   ├── api/                   # クライアント側APIコール（下記「API層」参照）
│   ├── services/               # サーバー側の業務ロジック（API RoutesとServer Componentsの両方から呼ばれる）
│   ├── prisma.ts              # Prisma Clientのシングルトン
│   └── auth/                  # Identity Platform SDKのラッパー
├── stores/                    # アプリ全体で使うグローバルjotai atom（例：現在ログイン中のユーザー）
├── types/                     # DBエンティティに対応する共有型（Project, ProjectStage, Deliverable等）
└── utils/                     # 共有ユーティリティ関数
```

### features一覧（`docs/README.md` C3と対応）

| フォルダ                   | 対応する画面                         |
| -------------------------- | ------------------------------------ |
| `features/auth`            | ログイン画面                         |
| `features/projects`        | 案件一覧画面                         |
| `features/stages`          | 案件詳細画面（工程別ワークスペース） |
| `features/admin-templates` | テンプレート管理画面                 |
| `features/admin-users`     | ユーザー管理画面                     |

各featureの中身は必要なフォルダのみ作成する（`components` `hooks` `stores` `types` `utils` のうち使うものだけ）。

### feature間import制限

featureをまたいだ直接importは禁止。共通化したい場合は`components` `hooks` `lib` `stores` `types` `utils`に上げる。ESLintの`import/no-restricted-paths`で強制する。

```js
// .eslintrc.js（抜粋）
'import/no-restricted-paths': [
  'error',
  {
    zones: [
      { target: './src/features/auth', from: './src/features', except: ['./auth'] },
      { target: './src/features/projects', from: './src/features', except: ['./projects'] },
      { target: './src/features/stages', from: './src/features', except: ['./stages'] },
      { target: './src/features/admin-templates', from: './src/features', except: ['./admin-templates'] },
      { target: './src/features/admin-users', from: './src/features', except: ['./admin-users'] },
      // 単方向アーキテクチャ（shared -> features -> app）
      { target: './src/features', from: './src/app' },
      {
        target: ['./src/components', './src/hooks', './src/lib', './src/types', './src/utils', './src/stores', './src/constants'],
        from: ['./src/features', './src/app'],
      },
    ],
  },
],
```

---

## コンポーネント設計方針

### 親子構造とファイル配置

`features/[画面]/components/`直下には、**その画面の親コンポーネント（エントリーポイント）のファイルだけ**を置く。それ以外の部品は、親コンポーネントと同名のフォルダを作りその中に格納する（どれが親か一目でわかるようにするため）。ネストが深くなる場合は、そのフォルダの中でさらに同じ考え方で親子構造を作る（再帰的に適用する）。

```
features/projects/components/
├── ProjectListScreen.tsx          # 親コンポーネント（画面のエントリーポイント）
└── ProjectListScreen/             # 親と同名フォルダに子部品を格納
    ├── ProjectListHeader.tsx
    ├── ProjectCard.tsx
    └── NewProjectModal.tsx
        └── NewProjectModal/       # NewProjectModal自体がさらに部品を持つ場合、同じ考え方でもう1段掘る
            └── ProjectNameField.tsx
```

**`src/components/`（アプリ全体の共有コンポーネント）も同じ考え方を適用するが、2種類のものが混在するので分ける。**

```
src/components/
├── ui/                    # shadcn/uiのCLIが生成するプリミティブ。フラットのまま触らない（button.tsx, card.tsx, table.tsx等）
├── table/                 # 自作の複合コンポーネントは「種類別フォルダ」を作る
│   ├── DataTable.tsx      # 親
│   └── DataTable/         # 子部品があれば同名フォルダへ
│       └── TableRowActions.tsx
├── card/
│   └── StatCard.tsx
└── button/
    └── IconButton.tsx
```

- `src/components/ui/`：shadcnのCLI（`npx shadcn add`）が生成する場所。フラットな1ファイル構成のまま変更しない（CLIを再実行した際に上書き・パスずれが起きるため）
- `src/components/`直下のそれ以外：shadcnのプリミティブを組み合わせて作る自作の複合コンポーネント。`table` `card` `button`のような**種類別フォルダ**を作り、その中に親（＋必要なら子フォルダ）を置く

各featureの親コンポーネント名は以下の通り（`docs/README.md` C3の画面構成に対応）。

| feature           | 親コンポーネント           |
| ----------------- | -------------------------- |
| `auth`            | `LoginScreen`              |
| `projects`        | `ProjectListScreen`        |
| `stages`          | `StageWorkspace`           |
| `admin-templates` | `TemplateManagementScreen` |
| `admin-users`     | `UserManagementScreen`     |

### Client Componentの境界

**`'use client'`は各画面の親コンポーネントにのみ付ける。** 子コンポーネントには基本的に付けない。

一度`'use client'`を付けた親から静的importされたコンポーネントは、子自身に`'use client'`が無くてもクライアント側のバンドルに含まれる（境界は親で1回作れば十分で、子に付け直しても意味的には変わらない）。そのため、通常は親だけに付ければ動作上問題ない。

例外として、ネストが深くなり特定のサブツリーだけを明確に切り出したい場合や、パフォーマンス上の理由（そのサブツリーだけ再レンダリングを局所化したい等）がある場合は、子コンポーネントに個別で`'use client'`を付けてサブ境界を作ってよい。

### 再利用・繰り返し処理

- 同じUIパターンが2箇所以上で使われる場合は、コピペで似たコンポーネントを増やさず、共有コンポーネント（`components/`、または`features/x/components`配下で複数の親から使う場合はそのfeature内の共有部品）として切り出して再利用する
- ロジックが重複する場合も同様に、`hooks/`のカスタムフックや`utils/`の関数として抽出し、呼び出し側で使い回す
- リスト表示・繰り返しUIは`.map()`で実装する。同じ構造のJSXを個別に並べて書かない

---

## データ取得パターン（重要・必ず従うこと）

**初期表示データは、page.tsx（Server Component）で`lib/services`を直接呼び出して取得する**。API Routes（`/api/...`）をfetchで叩かない（自分自身へのHTTPリクエストは不要なネットワークホップになるため）。

```tsx
// src/app/(dashboard)/projects/page.tsx
import { getProjectList } from '@/lib/services/projects'
import { ProjectListView } from '@/features/projects/components/ProjectListView'

export default async function ProjectsPage() {
  const projects = await getProjectList()
  return <ProjectListView initialProjects={projects} />
}
```

Client Component側でjotaiにデータを渡す際は、`jotai/utils`の`useHydrateAtoms`でハイドレートする（二重フェッチを防ぐため、useEffectで再取得しない）。

```tsx
// src/features/projects/components/ProjectListView.tsx
'use client'
import { useHydrateAtoms } from 'jotai/utils'
import { projectsAtom } from '../stores/projectsAtom'

export function ProjectListView({
  initialProjects,
}: {
  initialProjects: ProjectData[]
}) {
  useHydrateAtoms([[projectsAtom, initialProjects]])
  // ...
}
```

**それ以降のユーザー操作（作成・更新・実行など）は、Client Componentから`src/lib/api`配下の関数を呼ぶ**（下記「API層」参照）。

---

## 認証（セッションCookie）

Identity Platformのクライアント側SDKで取得したIDトークンは、そのままAPIへの認証情報として毎回使い回さない。ログイン成功時に1回だけサーバーへ送り、Firebase Admin SDKの`createSessionCookie`でセッションCookie（httpOnly）に変換して保存する。以降、`fetchData`はこのCookieを読んで各APIへ渡す。

```
1. クライアント：Identity Platform SDKでログイン → IDトークン取得
2. クライアント → POST /api/auth/session （IDトークンを送る）
3. サーバー：IDトークンを検証 → createSessionCookie() → Set-Cookie（httpOnly, 'session'）
4. 以降のリクエスト：fetchData（Server Action）がcookies()でsessionを読み取り、Authorizationヘッダに載せて呼び出す
5. 各APIルート：verifySessionCookie()で検証（`docs/README.md` C2の「IDトークンを検証」は、実装上はこのセッションCookie検証を指す）
```

各APIルートは、毎回自分でCookie検証・ユーザー取得を書かず、共通ヘルパーを呼ぶ。

```ts
// src/lib/auth/getCurrentUser.ts
import { cookies } from 'next/headers'
import { auth } from './firebaseAdmin'
import { prisma } from '@/lib/prisma'

/**
 * セッションCookieから現在のユーザー情報を取得する
 * @returns ユーザー情報（未ログイン・無効化済みの場合はnull）
 */
export async function getCurrentUser() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value
  if (!sessionCookie) return null

  try {
    const decoded = await auth.verifySessionCookie(sessionCookie)
    const user = await prisma.user.findUnique({
      where: { identityPlatformUid: decoded.uid },
    })
    if (!user || user.status === 'disabled') return null
    return user // { id, organizationId, role, email, ... }
  } catch {
    return null
  }
}
```

各APIルートの先頭で呼び、`user`が`null`なら`401`、`organization_id`が一致しなければ`403`、管理者用ルートで`role !== 'admin'`なら`403`を返す（`docs/README.md` C2のエラーコードに対応）。

### ルート保護（middleware）

`middleware.ts`（プロジェクトルート）でログイン有無だけを判定し、未ログインなら`/login`へリダイレクトする。**管理者ロールの判定はここでは行わない**（middlewareはEdge Runtimeで動作し、Prisma／Firebase Admin SDKが使えないため）。ロール判定は`app/(dashboard)/admin/layout.tsx`（Server Component）で`getCurrentUser()`を呼んで行う。

```ts
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/projects/:path*', '/admin/:path*'],
}
```

## 定数（`src/constants`）

```
src/constants/
├── messages.ts   # 画面に表示する日本語文字列を一元管理
└── response.ts   # HTTPステータスコードの定数（ERROR_STATUS / SUCCESS_STATUS）
```

```ts
// src/constants/response.ts
export const ERROR_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
} as const

export const SUCCESS_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
} as const
```

```ts
// src/constants/messages.ts
export const messages = {
  common: {
    errorMessage: {
      unauthorized: '認証に失敗しました。',
      forbidden: '権限がありません。',
      notFound: 'リソースが見つかりません。',
      conflict: '競合が発生しました。',
      unprocessableEntity: '不正なリクエストです。',
      tooManyRequests:
        'リクエストが混み合っています。しばらくしてから再度お試しください。',
      internalServerError: 'サーバーエラーが発生しました。',
      badGateway:
        'AIの実行に失敗しました。しばらくしてから再度お試しください。',
      otherError: 'リクエストに失敗しました。',
      error: 'エラーが発生しました。',
    },
    button: {
      edit: '編集する',
      save: '保存する',
      cancel: 'キャンセル',
      delete: '削除',
      create: '新規作成',
      copy: 'コピー',
    },
    input: {
      textPlaceholder: '入力してください',
      selectPlaceholder: '選択してください',
    },
    adf: 'AI Development Framework',
    description: 'AI活用の開発プロセス標準化ツール',
    projectList: '案件一覧',
    projectDetail: '案件詳細',
    templateManagement: 'テンプレート管理',
    userManagement: 'ユーザー管理',
  },
  auth: {
    loginTitle: 'ログイン',
    email: 'メールアドレス',
    password: 'パスワード',
    forgotPassword: 'パスワードをお忘れの方',
    loginButton: 'ログイン',
  },
  projects: {
    newProjectButton: '新規案件作成',
    projectNamePlaceholder: '案件名を入力',
    createModalTitle: '新規案件を作成',
    toastMessage: {
      successCreate: '案件を作成しました。',
    },
  },
  stages: {
    stageNames: {
      requirements: '要件定義',
      design: '設計',
      implementation: '実装',
      review: 'レビュー',
      security: 'セキュリティ',
      test: 'テスト',
      documentation: 'ドキュメント',
    },
    executionModeLabel: {
      promptOnly: 'プロンプトのみ出力',
      aiExecuted: 'アプリ内で実行',
    },
    toastMessage: {
      successAnswerSave: '回答を保存しました。',
      successExecute: 'AIによる生成が完了しました。',
      successDeliverableSave: '成果物を保存しました。',
      successQualityGatePass: '品質ゲートを通過しました。次の工程に進みます。',
    },
  },
  adminTemplates: {
    questionListLabel: '質問セット',
    promptTemplateLabel: 'プロンプトテンプレート',
    qualityGateLabel: '品質ゲート項目',
    toastMessage: {
      successUpdate: 'テンプレートを更新しました。',
    },
  },
  adminUsers: {
    inviteButton: 'メンバーを招待',
    roleLabel: 'ロール',
    statusLabel: 'ステータス',
    toastMessage: {
      successInvite: '招待メールを送信しました。',
      successUpdate: 'ユーザー情報を更新しました。',
    },
  },
}
```

> ⚠️ 文言は仮のたたき台。実際の画面文言はデザイン（Claude Design出力）に合わせて調整する。**画面に表示する日本語文字列は、コンポーネント内に直接書かず必ずここに追加してから参照する。**

## API層（`src/lib/api`）

エンドポイントはfeatureに分散させず、`src/lib/api`配下にリソース単位でまとめる（管理のしやすさを優先）。**`src/lib/api`配下のファイルはすべて先頭に`'use server'`を付ける**（`FetchData.ts`だけでなく`projects.ts`等の各リソースファイルも）。理由は、ミューテーション成功後に呼ぶ`revalidatePath`がサーバー専用関数のため、呼び出し元の関数自体がServer Actionである必要があるため。

```
src/lib/api/
├── FetchData.ts       # 共通fetchラッパー（Server Action）
├── projects.ts
├── stages.ts
├── adminTemplates.ts
└── adminUsers.ts
```

`APP_URL`は同一アプリ内の`/api`ルートを絶対URLで呼ぶために必要（Server Action = サーバー側実行のため、ブラウザと違い相対パスのfetchが使えないことに注意）。

```ts
// src/lib/api/FetchData.ts
'use server'

import { cookies } from 'next/headers'
import { messages } from '@/constants/messages'
import { ERROR_STATUS, SUCCESS_STATUS } from '@/constants/response'

const APP_URL = process.env.APP_URL // 例: http://localhost:3000 / Cloud RunのURL

export interface QueryParams {
  [key: string]: string | number | boolean | undefined
}

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: Record<string, unknown>
  headers?: Record<string, string>
}

/**
 * 共通APIフェッチ関数（Server Action）
 * @param path - APIパス（例: '/projects'）※先頭に/apiは付けない
 * @param params - クエリパラメータ（GET時のみ使用）
 * @param options - fetchのoptions（method・body等。省略時はGET）
 * @returns レスポンスのJSON。エラー時は`error`プロパティ（status/messages/errorText）を含む
 */
export async function fetchData(
  path: string,
  params?: QueryParams,
  options?: FetchOptions
) {
  try {
    const url = new URL(`${APP_URL}/api${path}`)
    const cookiesStore = await cookies()
    const sessionToken = cookiesStore.get('session')?.value

    if (params && (!options?.method || options.method === 'GET')) {
      for (const key of Object.keys(params)) {
        if (params[key] !== '' && params[key] !== undefined) {
          url.searchParams.append(key, String(params[key]))
        }
      }
    }

    const fetchOptions: RequestInit = {
      method: options?.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
        ...options?.headers,
      },
    }

    if (options?.body && options.method !== 'GET') {
      fetchOptions.body = JSON.stringify(options.body)
    }

    const response = await fetch(url.toString(), fetchOptions)

    if (!response.ok) {
      let errorDetail: string | null = null
      try {
        const errorBody = await response.json()
        errorDetail = errorBody?.detail || null
      } catch {
        // JSONパース失敗は無視
      }

      const errorMessageMap: Record<number, string> = {
        [ERROR_STATUS.UNAUTHORIZED]: messages.common.errorMessage.unauthorized,
        [ERROR_STATUS.FORBIDDEN]: messages.common.errorMessage.forbidden,
        [ERROR_STATUS.NOT_FOUND]: messages.common.errorMessage.notFound,
        [ERROR_STATUS.CONFLICT]: messages.common.errorMessage.conflict,
        [ERROR_STATUS.UNPROCESSABLE_ENTITY]:
          messages.common.errorMessage.unprocessableEntity,
        [ERROR_STATUS.TOO_MANY_REQUESTS]:
          messages.common.errorMessage.tooManyRequests,
        [ERROR_STATUS.INTERNAL_SERVER_ERROR]:
          messages.common.errorMessage.internalServerError,
        [ERROR_STATUS.BAD_GATEWAY]: messages.common.errorMessage.badGateway,
      }

      return {
        error: {
          status: response.status,
          messages:
            errorDetail ||
            errorMessageMap[response.status] ||
            messages.common.errorMessage.otherError,
          errorText: `Failed to fetch ${APP_URL}/api${path} ${response.status}`,
        },
      }
    }

    if (response.status === SUCCESS_STATUS.NO_CONTENT) {
      return {}
    }

    return await response.json()
  } catch (error: unknown) {
    return {
      error: {
        status: ERROR_STATUS.INTERNAL_SERVER_ERROR,
        messages: messages.common.errorMessage.error,
        errorText:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      },
    }
  }
}
```

各リソースのファイルでは、エンドポイントごとに関数を1つずつ定義する。JSDocは`@param 名 - 説明`の形式（ハイフン区切り）で必ず付ける。

**GET（単純取得）の例**

```ts
// src/lib/api/projects.ts
'use server'

import { fetchData } from './FetchData'
import { ProjectData } from '@/types/Project'

/**
 * 案件詳細取得API
 * @param id - 案件ID
 * @returns 案件データ
 */
export const getProject = async (id: string) => {
  const response = await fetchData(`/projects/${id}`)
  return response as
    | { project: ProjectData; error?: never }
    | { error: { status: number; messages: string; errorText: string } }
}
```

**POST（副作用を伴う操作）の例**：成功・失敗をtoastで必ず通知し、失敗時は`null`を返す

```ts
// src/lib/api/stages.ts
'use server'

import { revalidatePath } from 'next/cache'
import { fetchData } from './FetchData'
import { DeliverableData } from '@/types/Deliverable'
import { messages } from '@/constants/messages'
import { showSuccessToast, showErrorToast } from '@/utils/toast'

/**
 * 工程のAI実行API
 * @param projectId - 案件ID
 * @param stageKey - 工程キー
 * @returns 生成された成果物データ。エラー時はnull
 */
export const postExecuteStage = async (
  projectId: string,
  stageKey: string
): Promise<DeliverableData | null> => {
  const response = await fetchData(
    `/projects/${projectId}/stages/${stageKey}/execute`,
    undefined,
    { method: 'POST' }
  )

  if (response.error) {
    showErrorToast(response.error.messages)
    return null
  }

  revalidatePath(`/projects/${projectId}`)
  showSuccessToast(messages.stages.toastMessage.successExecute)
  return response.deliverable
}
```

**PUT（管理者用の全体更新）の例**：構造はPOSTと同じで、`method: 'PUT'`にする

```ts
// src/lib/api/adminTemplates.ts
'use server'

import { revalidatePath } from 'next/cache'
import { fetchData } from './FetchData'
import { StageTemplateData } from '@/types/StageTemplate'
import { messages } from '@/constants/messages'
import { showSuccessToast, showErrorToast } from '@/utils/toast'

/**
 * テンプレート更新API（質問セット・プロンプト・品質ゲート項目を新バージョンとして保存）
 * @param stageKey - 工程キー
 * @param payload - 更新後のテンプレート内容
 * @returns 更新後のバージョン番号。エラー時はnull
 */
export const putStageTemplate = async (
  stageKey: string,
  payload: Omit<StageTemplateData, 'version'>
): Promise<number | null> => {
  const response = await fetchData(`/admin/templates/${stageKey}`, undefined, {
    method: 'PUT',
    body: payload,
  })

  if (response.error) {
    showErrorToast(response.error.messages)
    return null
  }

  revalidatePath(`/admin/templates/${stageKey}`)
  showSuccessToast(messages.adminTemplates.toastMessage.successUpdate)
  return response.version
}
```

> 💡 `revalidatePath`に渡すパスは、そのミューテーションの影響を受ける画面（一覧・詳細）に合わせる（例：案件作成なら`/projects`、成果物更新なら`/projects/[id]`）。

**PATCH（部分更新：成果物編集・ユーザー無効化など）**：POST/PUTと同じ構造で`method: 'PATCH'`にする（`docs/README.md` C2の`PATCH /deliverable`・`PATCH /admin/users/:id`が該当）。

---

## 状態管理（jotai）

- 単一feature内でのみ使う状態 → `features/x/stores/`にatomを定義
- 複数featureで共有する状態（例：ログインユーザー情報） → `src/stores/`にatomを定義
- Server Componentから渡された初期データは`useHydrateAtoms`で受け取る（上記「データ取得パターン」参照）
- 派生値は`atom(get => ...)`の派生atomを使い、コンポーネント内での再計算を避ける

### ミューテーションのローディング状態

`isLoading`を各コンポーネントで個別に`useState`で持たず、共通フックでラップする（「再利用」ルールに従う）。

```ts
// src/hooks/useApiAction.ts
import { useState } from 'react'

/**
 * API呼び出しのローディング状態を管理する共通フック
 * @param action - src/lib/api の関数（成功時は値、失敗時はnullを返す想定）
 * @returns run（実行関数）とisLoading
 */
export function useApiAction<Args extends unknown[], T>(
  action: (...args: Args) => Promise<T | null>
) {
  const [isLoading, setIsLoading] = useState(false)

  const run = async (...args: Args) => {
    setIsLoading(true)
    const result = await action(...args)
    setIsLoading(false)
    return result
  }

  return { run, isLoading }
}
```

使用例：`const { run: executeStage, isLoading } = useApiAction(postExecuteStage)`

---

## UI / スタイリング

- コンポーネントは`shadcn/ui`のプリミティブをベースにする（`src/components/ui`に生成されたものをそのまま利用し、独自にゼロから書かない）
- スタイリングはTailwindのユーティリティクラスのみ。CSS Modulesやstyled-componentsは使わない
- カラーは`src/app/global.css`にCSS変数として定義し、`tailwind.config`でテーマ拡張として参照する。値はデザイン（Claude Design出力）から転記し、憶測で決めない
- Server Componentをデフォルトとする。`'use client'`の付け方は「コンポーネント設計方針」を参照（各画面の親コンポーネントにのみ付ける）

### トースト通知（sonner）

`sonner`を使用する（shadcnが現在推奨するトーストライブラリのため。旧`useToast`は使わない）。`src/app/provider.tsx`に`<Toaster />`を1つだけマウントし、各コンポーネントからは直接`sonner`を呼ばず、必ず`src/utils/toast.ts`経由で呼ぶ。

```ts
// src/utils/toast.ts
import { toast } from 'sonner'

/**
 * 成功トーストを表示する
 * @param message - 表示するメッセージ
 */
export const showSuccessToast = (message: string) => {
  toast.success(message)
}

/**
 * エラートーストを表示する
 * @param message - 表示するメッセージ
 */
export const showErrorToast = (message: string) => {
  toast.error(message)
}
```

---

## Prisma / DB

- スキーマは`prisma/schema.prisma`に定義する。テーブル定義は`docs/README.md` C1を正とする
- マイグレーションは`prisma migrate dev`で作成し、コミットに含める
- `lib/services`層以外からPrisma Clientを直接importしない（Server ComponentsもAPI Routesも、必ず`lib/services`の関数経由でDBにアクセスする）
- Prisma Clientは`lib/prisma.ts`でシングルトン化する（Next.jsの開発時ホットリロードでインスタンスが増殖し、DB接続を使い切る事故を防ぐため）

```ts
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

---

## やってはいけないこと

- Tailwindの警告をそのままにすること
- モックアップにない挙動を推測で実装しない（不明点は確認する）
- `lib/services`を経由せず、Server ComponentやAPI RouteからPrisma Clientを直接呼ばない
- Client ComponentからAPI Routeを経由せず直接Prismaやサーバー専用ロジックを呼ばない（`'use client'`のファイルに`lib/services`をimportしない）
- feature間の直接import
- `any`型の使用
- ハードコードされた色指定
- コンポーネント内への日本語文字列の直書き（`src/constants/messages.ts`を経由しない）
- `features/[画面]/components/`直下や`src/components/`直下に子部品を並べて置く（親以外は同名フォルダの中に入れる／種類別フォルダに分けない）
- `src/components/ui/`（shadcn生成物）の構成を手動で変更する
- 子コンポーネントへの`'use client'`の付けすぎ（親のみで足りる場合がほとんど）
- 同じUIパターン・ロジックのコピペによる重複実装
- コンポーネントから`sonner`の`toast`を直接呼ぶ（必ず`src/utils/toast.ts`経由）
- `src/lib/api`配下のミューテーション関数で`'use server'`を付け忘れる（`revalidatePath`が動かなくなる）

---

## 環境変数

| 変数名                                                                   | 用途                                                                                      |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                           | Prismaの接続文字列（Cloud SQL for PostgreSQL）                                            |
| `ANTHROPIC_API_KEY`                                                      | Claude API呼び出し用（サーバー側のみで使用。クライアントに露出させない）                  |
| `APP_URL`                                                                | `fetchData`が絶対URLを組み立てるために使用（例：`http://localhost:3000`／Cloud RunのURL） |
| `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` | Firebase Admin SDK用（セッションCookieの発行・検証）                                      |
| `NEXT_PUBLIC_FIREBASE_*`（API_KEY等）                                    | Identity Platformのクライアント側SDK設定                                                  |

`src/config/`でこれらをexportし、コンポーネント側で`process.env`を直接参照しない。

---

## 参照ドキュメント

- `docs/README.md` … 要件定義・基本設計・詳細設計（API仕様・DBスキーマ・品質ゲート等の正本）
