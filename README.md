# ai-development-framework

AI Development Framework（ADF）のリポジトリ。Webアプリの実装は `app/` 配下（Next.js App Router + PostgreSQL/Prisma + Identity Platform/Firebase Auth）。実装ルールは [`app/CLAUDE.md`](./app/CLAUDE.md)、要件・API・DB設計は `docs/README.md` を参照。

## 前提

- Node.js 20系
- Docker（Rancher Desktop 等。`docker compose` コマンドが使えること）

## セットアップ

以下はすべて `app/` ディレクトリで実行する。

### 1. 依存関係のインストール

```bash
cd app
npm install
```

`postinstall` で `prisma generate` が自動実行される。

### 2. 環境変数

```bash
cp .env.example .env
```

`.env.example` はローカル開発（下記のDocker PostgreSQL・Firebase Auth Emulator）にそのまま接続できる値が入っているため、通常は編集不要。本番相当の値（Cloud SQL・実Firebaseプロジェクト等）で動かす場合のみ書き換える。

### 3. PostgreSQL・Firebase Auth Emulatorのセットアップ

```bash
npm run setup
```

以下を順に行う一括セットアップスクリプト（`scripts/setup.sh`）。

- `docker compose up -d`でPostgreSQL起動（ホスト側5433番。5432番は他のネイティブPostgreSQLと衝突することがあるため変更している。`app/docker-compose.yml`参照）
- `prisma migrate dev`でテーブル作成
- 動作確認用の会社・system_adminユーザーをDBに投入
- Firebase Auth Emulatorをバックグラウンドで起動（実際のFirebaseプロジェクトは不要）
- Emulatorにテストユーザーを作成（DB側のsystem_adminユーザーとuidを一致させ済み）

完了後、以下でログインできる。

```
メールアドレス: system-admin@example.com
パスワード: password1234
```

Emulator UIは http://127.0.0.1:4000 で確認できる。個別に実行したい場合は `npm run db:up` / `db:migrate` / `db:seed` / `emulators:up` / `emulators:seed` をそれぞれ使う（下記スクリプト一覧参照）。

### 4. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 を開く。

## コミット前の確認

```bash
npm run precommit
```

`build` → `format` → `lint` を順に実行する。エラーなく完了することを確認してからコミットする。

## スクリプト一覧（`app/`配下で実行）

| コマンド                                  | 内容                                                                           |
| ----------------------------------------- | ------------------------------------------------------------------------------ |
| `npm run dev`                             | 開発サーバー起動                                                               |
| `npm run build`                           | 本番ビルド                                                                     |
| `npm run start`                           | 本番ビルドの起動                                                               |
| `npm run lint` / `npm run lint:fix`       | ESLint実行 / 自動修正                                                          |
| `npm run format` / `npm run format:check` | Prettier整形 / チェックのみ                                                    |
| `npm run db:up` / `npm run db:down`       | ローカルPostgreSQLの起動 / 停止                                                |
| `npm run db:migrate`                      | `prisma migrate dev`（マイグレーション作成・適用）                             |
| `npm run db:generate`                     | Prisma Clientの再生成                                                          |
| `npm run db:seed`                         | 動作確認用シードデータ投入（`prisma/seed/`）                                   |
| `npm run emulators:up`                    | Firebase Auth Emulator起動                                                     |
| `npm run emulators:seed`                  | Emulatorにテストユーザー作成（`scripts/seedFirebaseAuthEmulator.mjs`）         |
| `npm run setup`                           | 上記db/emulators系を一括実行するローカル環境セットアップ（`scripts/setup.sh`） |
| `npm run precommit`                       | `build` → `format:check` → `lint` を一括実行するコミット前チェック             |
