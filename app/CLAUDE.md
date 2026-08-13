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
| フォーム管理   | zod（スキーマ定義・バリデーション） |
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
7. **関数（コンポーネント・hooks・ユーティリティ・APIハンドラ等）には、宣言の1行上に一行コメントで簡潔な説明を書く**。`src/lib/frontend/apiClient`配下など既存のJSDoc形式（`@param 名 - 説明`）がある箇所はそれを維持すればよい。`src/components/ui/`のshadcn生成物は対象外（生成物の構成を手動で変更しないため）

---

## ディレクトリ構成

feature-basedの構成を採用する。Next.js App Routerの`app/`はルーティング専用の特殊フォルダのため、bulletproof-react準拠の構成を以下のように読み替える。加えて、`app/api`（バックエンド）はroute/service/repositoryの3層構成、`lib`と`schemas`は「利用するレイヤー（バックエンド専用／フロントエンド専用／共通）」を基準にサブフォルダを分ける（詳細は後述の各セクション）。

```
src
├── app/                      # Next.js App Router（ルーティング専用。page.tsx/layout.tsx/route.tsのみ）
│   ├── (no-auth)/            # 認証不要（ログインするまで）の画面
│   │   ├── page.tsx          # ウェルカム画面（/）
│   │   └── login/page.tsx    # ログイン画面
│   ├── (auth)/                # 認証必須（ログイン後）の画面
│   │   ├── projects/
│   │   │   ├── page.tsx              # 案件一覧
│   │   │   └── [projectId]/page.tsx  # 案件詳細（工程別ワークスペース）
│   │   └── admin/
│   │       ├── templates/
│   │       │   ├── page.tsx          # マイテンプレート一覧
│   │       │   └── [stageKey]/page.tsx  # テンプレート詳細（工程別編集画面）
│   │       └── users/page.tsx
│   ├── api/                  # API Routes（docs/README.md の B6/C2 と1対1対応させる）。route/service/repositoryの3層構成は「API実装（route/service/repository）」参照
│   │   ├── auth/session/route.ts
│   │   ├── projects/
│   │   │   ├── route.ts
│   │   │   ├── service.ts
│   │   │   ├── repository.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts                     # ../service.ts を利用
│   │   │       └── stages/[stageKey]/
│   │   │           ├── route.ts
│   │   │           ├── service.ts
│   │   │           ├── repository.ts
│   │   │           ├── answers/route.ts          # ../service.ts を利用
│   │   │           ├── generate-prompt/route.ts  # ../service.ts を利用
│   │   │           ├── execute/route.ts          # ../service.ts を利用
│   │   │           ├── deliverable/route.ts      # ../service.ts を利用
│   │   │           └── quality-gate/route.ts     # ../service.ts を利用
│   │   └── admin/
│   │       ├── templates/
│   │       │   ├── route.ts
│   │       │   ├── service.ts
│   │       │   ├── repository.ts
│   │       │   └── [stageKey]/
│   │       │       ├── route.ts                        # ../service.ts を利用
│   │       │       └── versions/[version]/route.ts     # ../../service.ts を利用
│   │       └── users/
│   │           ├── route.ts
│   │           ├── service.ts
│   │           ├── repository.ts
│   │           └── [id]/route.ts                # ../service.ts を利用
│   ├── layout.tsx
│   └── provider.tsx          # jotaiのProvider、sonnerの<Toaster />等、グローバルプロバイダをまとめる
│
├── components/                # ui/（shadcn生成物）＋ table/ card/ button/ 等の種類別フォルダ（詳細は「コンポーネント設計方針」）
├── config/                    # 環境変数のエクスポート、定数
├── constants/                  # messages.ts（日本語文字列）、response.ts（HTTPステータス定数）。API・フロント共通のため層分けの対象外
├── features/                  # 機能単位のモジュール（下記「features一覧」参照）
├── hooks/                     # 複数featureで使う共有hooks
├── lib/                       # 「利用するレイヤー」で分ける（詳細は「libのレイヤー分け」）
│   ├── api/                   # バックエンド専用の共通処理
│   │   ├── prisma.ts          # Prisma Clientのシングルトン
│   │   ├── response.ts        # API RouteのレスポンスをNextResponse.jsonで返す共通ヘルパー
│   │   └── auth/              # Identity Platform（Firebase Admin SDK）のラッパー
│   ├── frontend/               # フロントエンド専用の共通処理
│   │   └── apiClient/         # 旧`lib/api`。fetchDataベースのAPI呼び出し関数群（詳細は「APIクライアント層」）
│   └── （直下）                # API・フロント両方から使うが、utils/constants等の既存フォルダに当てはまらない共有ライブラリコード
├── schemas/                   # zodスキーマ。「利用するレイヤー」で分ける（詳細は「フォームバリデーション（zod）」）
│   ├── api/                    # APIルート内部でのみ使うスキーマ
│   ├── frontend/                # フォームの入力検証などフロントエンド専用スキーマ
│   └── （直下）                # フォームとAPI両方から使う共有スキーマ（例：CreateProjectSchema）
├── stores/                    # アプリ全体で使うグローバルjotai atom（例：現在ログイン中のユーザー）
├── types/                     # DBエンティティに対応する共有型（Project, ProjectStage, Deliverable等）
├── utils/                     # 共有ユーティリティ関数
└── prisma/                    # schema.prisma、マイグレーション
```

### features一覧（`docs/README.md` C3と対応）

| フォルダ                   | 対応する画面                         |
| -------------------------- | ------------------------------------ |
| `features/auth`            | ログイン画面                         |
| `features/projects`        | 案件一覧画面                         |
| `features/stages`          | 案件詳細画面（工程別ワークスペース） |
| `features/admin-templates` | マイテンプレート一覧画面・テンプレート詳細画面 |
| `features/admin-users`     | ユーザー管理画面                     |

各featureの中身は必要なフォルダのみ作成する（`components` `hooks` `stores` `types` `utils` のうち使うものだけ）。zodスキーマはfeature配下には置かず、`src/schemas`に統一する（詳細は「フォームバリデーション（zod）」参照）。

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
| `admin-templates` | `MyTemplateListScreen` / `TemplateDetailScreen` |
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

## API実装（route/service/repository）

`app/api`配下は、責務ではなく「リソース」単位でフォルダを切り、その中に`route.ts` `service.ts` `repository.ts`をまとめる。

| ファイル | 責務 |
|---|---|
| `route.ts` | リクエストの受付、`getCurrentUser`による認証・認可チェック、`schemas`のzodスキーマによるバリデーション、`service`の呼び出し、`lib/api/response.ts`経由でのレスポンス返却 |
| `service.ts` | ビジネスロジック。`repository`の呼び出し、複数repositoryの組み合わせ |
| `repository.ts` | Prismaを使ったDBアクセス。SQLに近い処理のみを持つ（ビジネスロジックを書かない） |

### ネストしたルートの扱い

Next.jsの動的ルート（`[id]` `[stageKey]`等）が深くネストする場合、ネストのたびに`service.ts`/`repository.ts`を作らない。**同じリソースを扱う一番浅い階層に1組だけ**`service.ts`/`repository.ts`を置き、ネストしたルートの`route.ts`はそこを相対importする（例：`projects/[id]/route.ts`は`../service`を、`projects/[id]/stages/[stageKey]/answers/route.ts`は`../service`を参照する。ディレクトリ構成の図中のコメントを参照）。「stages」は案件（projects）とは別のリソースとみなし、`projects/[id]/stages/[stageKey]/`の階層に独自の`service.ts`/`repository.ts`を持つ。

### 実装例（projectsリソース）

```ts
// src/app/api/projects/repository.ts
import { prisma } from '@/lib/api/prisma'

// 組織に紐づく案件を、工程別ステータス付きで取得する
export async function findProjectsByOrganization(organizationId: string) {
  return prisma.project.findMany({
    where: { organizationId },
    include: { stages: true },
  })
}

// 案件を作成する
export async function createProject(data: { organizationId: string; userId: string; name: string }) {
  return prisma.project.create({
    data: { organizationId: data.organizationId, createdBy: data.userId, name: data.name },
  })
}

const STAGE_KEYS = ['requirements', 'design', 'implementation', 'review', 'security', 'test', 'documentation'] as const

// 7工程分のproject_stagesレコードを初期化する
export async function initializeProjectStages(projectId: string) {
  await prisma.projectStage.createMany({
    data: STAGE_KEYS.map((stageKey) => ({ projectId, stageKey, status: 'not_started' })),
  })
}
```

```ts
// src/app/api/projects/service.ts
import * as repository from './repository'
import type { CreateProjectInput } from '@/schemas/createProjectSchema'

// 案件一覧を取得する
export async function getProjectList(organizationId: string) {
  return repository.findProjectsByOrganization(organizationId)
}

// 案件を作成し、7工程分のproject_stagesを初期化する
export async function createProject(organizationId: string, userId: string, input: CreateProjectInput) {
  const project = await repository.createProject({ organizationId, userId, name: input.name })
  await repository.initializeProjectStages(project.id)
  return project
}
```

```ts
// src/app/api/projects/route.ts
import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/api/auth/getCurrentUser'
import { apiError, apiSuccess } from '@/lib/api/response'
import { ERROR_STATUS } from '@/constants/response'
import { createProjectSchema } from '@/schemas/createProjectSchema'
import { getProjectList, createProject } from './service'

// 案件一覧を取得する
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return apiError(ERROR_STATUS.UNAUTHORIZED)

  const projects = await getProjectList(user.organizationId)
  return apiSuccess({ projects })
}

// 案件を作成する
export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return apiError(ERROR_STATUS.UNAUTHORIZED)

  const body = await request.json()
  const parsed = createProjectSchema.safeParse(body)
  if (!parsed.success) {
    return apiError(ERROR_STATUS.UNPROCESSABLE_ENTITY, parsed.error.issues[0].message)
  }

  const project = await createProject(user.organizationId, user.id, parsed.data)
  return apiSuccess(project, { status: 201 })
}
```

ネストしたルート（`[id]/route.ts`）は同じ`service`を相対importする。

```ts
// src/app/api/projects/[id]/route.ts
import { getCurrentUser } from '@/lib/api/auth/getCurrentUser'
import { apiError, apiSuccess } from '@/lib/api/response'
import { ERROR_STATUS } from '@/constants/response'
import { getProjectDetail } from '../service'

// 案件詳細を取得する
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return apiError(ERROR_STATUS.UNAUTHORIZED)

  const { id } = await params
  const project = await getProjectDetail(user.organizationId, id)
  if (!project) return apiError(ERROR_STATUS.NOT_FOUND)

  return apiSuccess(project)
}
```

### 共通レスポンスヘルパー（`lib/api/response.ts`）

```ts
// src/lib/api/response.ts
import { NextResponse } from 'next/server'
import { messages } from '@/constants/messages'

/**
 * 成功レスポンスを返す
 * @param data - レスポンスボディ
 * @param init - ステータスコード等（省略時は200）
 */
export function apiSuccess<T>(data: T, init?: { status?: number }) {
  return NextResponse.json(data, { status: init?.status ?? 200 })
}

/**
 * エラーレスポンスを返す
 * @param status - HTTPステータスコード
 * @param detail - 詳細メッセージ（省略時はステータスコードに応じた既定文言はクライアント側のfetchDataが補う）
 */
export function apiError(status: number, detail?: string) {
  return NextResponse.json(
    { detail: detail ?? messages.common.errorMessage.otherError },
    { status }
  )
}
```

---

## データ取得パターン（重要・必ず従うこと）

**初期表示データも含めて、APIの呼び出しは必ず`src/lib/frontend/apiClient`配下の`fetchData`ベースの関数を経由する**。`page.tsx`（Server Component）からrepositoryやPrisma Clientを直接呼ばない（下記「APIクライアント層」参照）。初期表示・ユーザー操作を問わず呼び出し口を`lib/frontend/apiClient`に統一することで、モック時の差し替えもこの層だけで完結する。

```tsx
// src/app/(auth)/projects/page.tsx
import { getProjectList } from '@/lib/frontend/apiClient/projects'
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

// 案件一覧画面。Server Componentから受け取った初期データをjotaiにハイドレートする
export function ProjectListView({
  initialProjects,
}: {
  initialProjects: ProjectData[]
}) {
  useHydrateAtoms([[projectsAtom, initialProjects]])
  // ...
}
```

**それ以降のユーザー操作（作成・更新・実行など）も、Client Componentから同じく`src/lib/frontend/apiClient`配下の関数を呼ぶ**（下記「APIクライアント層」参照）。初期表示・ユーザー操作のどちらも呼び出し先は`lib/frontend/apiClient`で統一され、違いはServer Component/Client Componentのどちらから呼ぶかだけになる。

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
// src/lib/api/auth/firebaseAdmin.ts
// firebase-adminは環境変数未設定時にモジュール読み込み時点でクラッシュするため、
// 初回呼び出し時まで初期化を遅延させる（`getFirebaseAdminAuth()`経由でのみ使う）
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { firebaseAdminConfig } from '@/config/env'

let app: App | undefined

// Firebase Admin Appのシングルトンを初回呼び出し時に生成する
function getFirebaseAdminApp(): App {
  if (!app) {
    app = getApps()[0] ?? initializeApp({ credential: cert(firebaseAdminConfig) })
  }
  return app
}

/**
 * セッションCookieの発行・検証に使うFirebase Admin Authを取得する
 */
export function getFirebaseAdminAuth(): Auth {
  return getAuth(getFirebaseAdminApp())
}
```

```ts
// src/lib/api/auth/getCurrentUser.ts
import { cookies, headers } from 'next/headers'
import { getFirebaseAdminAuth } from './firebaseAdmin'
import { prisma } from '@/lib/api/prisma'
import { SESSION_COOKIE_NAME } from '@/config/env'

const BEARER_PREFIX = 'Bearer '

/**
 * リクエストからセッションCookieの値を取り出す
 *
 * APIルートは`fetchData`（Server Action）経由で呼ばれる場合が大半で、`fetchData`はCookieをそのまま
 * 転送せず`Authorization: Bearer <session cookie>`ヘッダとして送る（下記「データ取得パターン」参照）。
 * 一方、Server Component（`app/(auth)/admin/layout.tsx`等）からブラウザの実リクエストの一部として
 * 直接呼ばれる場合は、Authorizationヘッダは付かずCookieとして届く。両方をサポートする
 * （`Authorization`ヘッダを見ずに`cookies()`だけで実装すると、Server Action内部からの`fetch`呼び出しには
 * ブラウザのCookieが自動転送されないため、`fetchData`経由の呼び出しが常に未ログイン扱いになってしまう）
 */
async function resolveSessionCookie(): Promise<string | undefined> {
  const headerStore = await headers()
  const authorization = headerStore.get('authorization')
  if (authorization?.startsWith(BEARER_PREFIX)) {
    return authorization.slice(BEARER_PREFIX.length)
  }

  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE_NAME)?.value
}

/**
 * セッションCookieから現在のユーザー情報を取得する
 * @returns ユーザー情報（未ログイン・無効化済みの場合はnull）
 */
export async function getCurrentUser() {
  const sessionCookie = await resolveSessionCookie()
  if (!sessionCookie) return null

  try {
    const decoded = await getFirebaseAdminAuth().verifySessionCookie(sessionCookie)
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

`POST`／`DELETE /api/auth/session`だけは例外で、ブラウザのクライアントコンポーネントから`fetchData`を経由せず直接`fetch`する（ログイン前でセッションCookie自体をこれから発行する／破棄するだけのエンドポイントのため）。この2つは実際にブラウザのCookieが載った直接リクエストなので、`POST`のセッションCookie発行自体は`cookies().set(...)`で行う（`getCurrentUser()`とは別の話）。

### ルート保護（`src/proxy.ts`）

Next.js 16では`middleware.ts`は`proxy.ts`に名称変更されている（エクスポートする関数名も`middleware`ではなく`proxy`）。**本プロジェクトでは必ず`proxy.ts`を使う**（`middleware.ts`は使わない）。ログイン有無だけを判定し、未ログインなら`/login`へリダイレクトする。**管理者ロールの判定はここでは行わない**（proxyはEdge Runtimeで動作し、Prisma／Firebase Admin SDKが使えないため）。ロール判定は`app/(auth)/admin/layout.tsx`（Server Component）で`getCurrentUser()`を呼んで行う。

```ts
// src/proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE_NAME } from '@/config/env'

// 未ログインで保護ルートにアクセスした場合、/loginへリダイレクトする
export function proxy(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE_NAME)?.value
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
    myTemplates: 'マイテンプレート',
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
    listTitle: 'マイテンプレート',
    backToListLink: 'マイテンプレート一覧に戻る',
    questionListLabel: '質問セット',
    promptTemplateLabel: 'プロンプトテンプレート',
    qualityGateLabel: '品質ゲート項目',
    versionHistoryLabel: 'バージョン履歴',
    saveButton: 'テンプレートを保存',
    versionDiffTitle: 'バージョン差分',
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

## APIクライアント層（`src/lib/frontend/apiClient`）

エンドポイントはfeatureに分散させず、`src/lib/frontend/apiClient`配下にリソース単位のフォルダでまとめる（管理のしやすさを優先）。1エンドポイント＝1ファイル（ファイル名は関数名と一致させる）とし、リソースごとにフォルダを切る。**`src/lib/frontend/apiClient`配下のファイルはすべて先頭に`'use server'`を付ける**（`FetchData.ts`だけでなく各エンドポイントのファイルも）。理由は、ミューテーション成功後に呼ぶ`revalidatePath`がサーバー専用関数のため、呼び出し元の関数自体がServer Actionである必要があるため。

**`lib/frontend/apiClient`配下のGET関数は、Server Component（`page.tsx`）の初期表示・Client Componentのユーザー操作のどちらからも呼ばれる**（Server ActionはServer Component・Client Componentのどちらからも呼び出せるため問題ない）。呼び出し元によって関数を分ける必要はない。

```
src/lib/frontend/apiClient/
├── FetchData.ts             # 共通fetchラッパー（Server Action）
├── projects/
│   ├── getProjectList.ts
│   ├── getProject.ts
│   └── createProject.ts
├── stages/
│   └── postExecuteStage.ts
├── adminTemplates/
│   └── putStageTemplate.ts
└── adminUsers/
```

`APP_URL`は同一アプリ内の`/api`ルートを絶対URLで呼ぶために必要（Server Action = サーバー側実行のため、ブラウザと違い相対パスのfetchが使えないことに注意）。

```ts
// src/lib/frontend/apiClient/FetchData.ts
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

1ファイルにつきエンドポイント1つ（＝関数1つ）を定義する。JSDocは`@param 名 - 説明`の形式（ハイフン区切り）で必ず付ける。

**GET（単純取得）の例**

```ts
// src/lib/frontend/apiClient/projects/getProject.ts
'use server'

import { fetchData } from '../FetchData'
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
// src/lib/frontend/apiClient/stages/postExecuteStage.ts
'use server'

import { revalidatePath } from 'next/cache'
import { fetchData } from '../FetchData'
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
// src/lib/frontend/apiClient/adminTemplates/putStageTemplate.ts
'use server'

import { revalidatePath } from 'next/cache'
import { fetchData } from '../FetchData'
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
 * @param action - src/lib/frontend/apiClient の関数（成功時は値、失敗時はnullを返す想定）
 * @returns run（実行関数）とisLoading
 */
export function useApiAction<Args extends unknown[], T>(
  action: (...args: Args) => Promise<T | null>
) {
  const [isLoading, setIsLoading] = useState(false)

  // isLoadingを管理しながらactionを実行する
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

## フォームバリデーション（zod）

**入力を伴うフォームは、必ずzodのスキーマでバリデーションする**（React Hook Formのようなフォームライブラリは使わず、`useState`によるローカル状態管理＋zodの`safeParse`の組み合わせのみで統一する）。**APIルートのリクエストボディのバリデーションにも同じzodスキーマを使う**（`route.ts`の「バリデーション」責務。詳細は「API実装（route/service/repository）」参照）。

スキーマの置き場所は、feature配下ではなく`src/schemas`に統一し、「利用するレイヤー」で分ける（ディレクトリ構成参照）。

| 置き場所 | 使う場面 |
|---|---|
| `schemas/frontend/` | フロントエンドのフォームでのみ使う（APIには送らない値の検証。例：ログインフォーム） |
| `schemas/api/` | APIルート内部でのみ使う（管理用APIの内部処理等） |
| `schemas/`（直下） | フォームの入力値とAPIのリクエストボディの両方に使う共有スキーマ（例：案件作成） |

- ファイル名は`xxxSchema.ts`とし、スキーマ本体（`xxxSchema`）と`z.infer`で導出した型（`XxxInput`）の両方をexportする
- バリデーションエラーメッセージも画面表示文字列のため、スキーマ内に直接日本語を書かず`src/constants/messages.ts`から参照する
- フォーム側は`<form>`に`noValidate`を付け、HTML標準のバリデーション（`required`等）と二重にならないようにする。送信時に`schema.safeParse()`を呼び、失敗した場合は最初のissueのmessageを画面表示用のエラー状態にセットする
- `types/`（DBエンティティの型）と`schemas/`（入力値のバリデーション）は役割が異なる。API・フォームから受け取る値の検証には`schemas/`を使い、DBから取得したデータの型には`types/`を使う

**フロントエンド専用の例（ログインフォーム。Identity Platform側で認証するため、APIへのリクエストボディ検証は不要でフロントのみで完結）**

```ts
// src/schemas/frontend/loginSchema.ts
import { z } from 'zod'
import { messages } from '@/constants/messages'

export const loginSchema = z.object({
  email: z.email(messages.auth.validation.emailInvalid),
  password: z.string().min(1, messages.auth.validation.passwordRequired),
})

export type LoginInput = z.infer<typeof loginSchema>
```

```tsx
// 呼び出し側（フォームのonSubmit内）
const validation = loginSchema.safeParse({ email, password })
if (!validation.success) {
  setErrorMessage(validation.error.issues[0].message)
  return
}
// validation.data が型付き・検証済みの値
```

**共有スキーマの例（案件作成。`NewProjectModal`のフォームと、`POST /api/projects`のリクエストボディ検証の両方で同じスキーマを使う）**

```ts
// src/schemas/createProjectSchema.ts
import { z } from 'zod'
import { messages } from '@/constants/messages'

export const createProjectSchema = z.object({
  name: z.string().min(1, messages.projects.validation.nameRequired).max(255),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
```

```tsx
// フロント側：src/features/projects/components/ProjectListScreen/NewProjectModal.tsx
const validation = createProjectSchema.safeParse({ name })
if (!validation.success) {
  setErrorMessage(validation.error.issues[0].message)
  return
}
await createProject(validation.data)
```

```ts
// バックエンド側：src/app/api/projects/route.ts（抜粋。「API実装（route/service/repository）」参照）
const parsed = createProjectSchema.safeParse(body)
if (!parsed.success) {
  return apiError(ERROR_STATUS.UNPROCESSABLE_ENTITY, parsed.error.issues[0].message)
}
```

---

## UI / スタイリング

- コンポーネントは`shadcn/ui`のプリミティブをベースにする（`src/components/ui`に生成されたものをそのまま利用し、独自にゼロから書かない）
- スタイリングはTailwindのユーティリティクラスのみ。CSS Modulesやstyled-componentsは使わない
- カラーは`src/app/global.css`にCSS変数として定義し、`tailwind.config`でテーマ拡張として参照する。値はデザイン（Claude Design出力）から転記し、憶測で決めない
- Server Componentをデフォルトとする。`'use client'`の付け方は「コンポーネント設計方針」を参照（各画面の親コンポーネントにのみ付ける）

### shadcn/uiのセットアップとテーマトークン

`components.json`は`tailwind.config`を持たない（Tailwind v4のCSSファーストのため`"config": ""`）。shadcnのCLIが生成するコンポーネント（`bg-primary`/`text-foreground`/`border-input`/`ring-ring`等）は、このプロジェクト独自のトークン名（`--color-accent`/`--color-surface`/`--color-divider`等）とは別名のため、`src/app/globals.css`の`:root`と`@theme inline`に**shadcn標準トークン名を独自トークンへのエイリアスとして追加**してある（`--color-primary: var(--color-accent);` のように）。新しいshadcnコンポーネントを`npx shadcn add`で追加した際、生成コードが未定義のトークン（例：`--color-chart-1`）を参照していたら、同じ要領でエイリアスを追加する（**生成された`src/components/ui/*.tsx`自体は編集しない**）。

**Radix UIベースのコンポーネント（`Button`の`asChild`、`Label`、`Separator`、`Dialog`等）はクライアント側でcontextを使うため、これらを使う画面の親コンポーネントには必ず`'use client'`を付ける**（`WelcomeScreen`のようにインタラクションが無い画面でも、shadcnのプリミティブを1つでも使えば対象になる）。

Radixコンポーネントの内部クラス（例：`Separator`の`data-[orientation=vertical]:h-full`）は属性セレクタ込みでCSS詳細度が高く、`className`で上書きしようとしても後勝ちにならないことがある。上書きが効かない場合は`style`propで直接指定する（`ui/`ファイル自体は編集しない）。

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
- **Prisma Clientは各リソースの`repository.ts`からのみimportする**（`route.ts` `service.ts`からは直接呼ばない。DBアクセスの窓口を`repository.ts`に一本化するため。詳細は「API実装（route/service/repository）」参照）
- Prisma Clientは`lib/api/prisma.ts`でシングルトン化する（Next.jsの開発時ホットリロードでインスタンスが増殖し、DB接続を使い切る事故を防ぐため）

```ts
// src/lib/api/prisma.ts
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
- `repository.ts`を経由せず、`route.ts`や`service.ts`からPrisma Clientを直接呼ばない
- `route.ts`にビジネスロジックを直接書く（`service.ts`に書く）。`service.ts`にDBアクセスの詳細（Prismaのクエリ）を直接書く（`repository.ts`に書く）
- Server Component（`page.tsx`）から`service.ts`や`repository.ts`、Prisma Clientを直接呼ばない（必ず`lib/frontend/apiClient`経由でAPI Routeを叩く）
- Client ComponentからAPI Routeを経由せず直接Prismaやサーバー専用ロジックを呼ばない（`'use client'`のファイルに`service.ts`や`repository.ts`をimportしない）
- `lib/api`（バックエンド専用）にブラウザAPI依存のコードを置く、`lib/frontend`（フロントエンド専用）にPrisma等サーバー依存のコードを置く（利用するレイヤーを取り違えない）
- feature間の直接import
- `any`型の使用
- ハードコードされた色指定
- コンポーネント内への日本語文字列の直書き（`src/constants/messages.ts`を経由しない）
- `features/[画面]/components/`直下や`src/components/`直下に子部品を並べて置く（親以外は同名フォルダの中に入れる／種類別フォルダに分けない）
- `src/components/ui/`（shadcn生成物）の構成を手動で変更する
- 子コンポーネントへの`'use client'`の付けすぎ（親のみで足りる場合がほとんど）
- 同じUIパターン・ロジックのコピペによる重複実装
- コンポーネントから`sonner`の`toast`を直接呼ぶ（必ず`src/utils/toast.ts`経由）
- `src/lib/frontend/apiClient`配下のミューテーション関数で`'use server'`を付け忘れる（`revalidatePath`が動かなくなる）
- フォームのバリデーションをzodのスキーマ経由にせず、HTML標準バリデーション（`required`等）や独自の手書きロジックだけで済ませる
- `middleware.ts`を作成する（Next.js 16では`proxy.ts`を使う）
- zodスキーマを`features/x/schemas/`配下に置く（`src/schemas`に統一する）

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
- `.claude/backend-code-review-checklist.md` … バックエンド（route/service/repository）実装時・レビュー時のチェックリスト。API実装を書き終えたら必ず参照する
