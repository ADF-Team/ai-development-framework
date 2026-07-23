---
sidebar_position: 1
title: インフラ
---

# インフラ

技術スタックは`docs/README.md` B1で確定済み。Terraformでの構成図・CI/CD・環境変数の詳細は、実装が進み次第ここに追記していく（現時点では準備中）。

## 技術スタック（確定）

| 領域                         | 選定                     | 備考                                                                                                                                            |
| ---------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| フロントエンド／バックエンド | Next.js（一本化）        | API Routesでバックエンドロジックも実装。将来FastAPIへの切り出しを見据え、ルートハンドラは薄く保ち、業務ロジックは`lib/services`等に分離しておく |
| インフラ管理                 | Terraform                | GCPリソースをコードで管理                                                                                                                       |
| クラウド                     | Google Cloud             |                                                                                                                                                 |
| デプロイ先                   | Cloud Run（想定）        | Next.jsをコンテナ化してデプロイ。Terraform管理・サーバーレスの構成と自然に整合する                                                              |
| 認証                         | Identity Platform        | Firebase Authのアップグレード版。将来の他社ライセンス提供（Phase3）時にマルチテナント機能をそのまま使う                                         |
| AI API                       | Claude（Anthropic API）  | Next.js API Routesのサーバーサイドから呼び出し、APIキーはクライアントに露出させない                                                             |
| DB                           | Cloud SQL for PostgreSQL | 案件・工程・テンプレート・品質ゲート等のリレーショナルなデータ構造と相性が良い                                                                  |
| ストレージ                   | Cloud Storage            | 生成物のファイルエクスポート等に使用                                                                                                            |

## 環境変数

`CLAUDE.md`の「環境変数」セクションを参照（`DATABASE_URL` / `ANTHROPIC_API_KEY` / `APP_URL` / `FIREBASE_*` / `NEXT_PUBLIC_FIREBASE_*`）。
