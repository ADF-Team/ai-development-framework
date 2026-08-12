#!/usr/bin/env bash
# ローカル開発環境の一括セットアップ（PostgreSQLコンテナ起動→マイグレーション→シード→Firebase Auth Emulator起動→シード）
set -e

npm run db:up

echo "PostgreSQLの起動を待っています..."
until docker compose exec -T db pg_isready -U adf -d adf_dev >/dev/null 2>&1; do
  sleep 1
done

npm run db:migrate
npm run db:seed

if (echo > /dev/tcp/localhost/9099) >/dev/null 2>&1; then
  echo "Firebase Auth Emulatorは既に起動しています"
else
  echo "Firebase Auth Emulatorを起動しています..."
  npm run emulators:up > /tmp/adf-emulator.log 2>&1 &
  disown

  until (echo > /dev/tcp/localhost/9099) >/dev/null 2>&1; do
    sleep 1
  done
fi

npm run emulators:seed

echo ""
echo "セットアップ完了です。npm run dev で開発サーバーを起動してください。"
echo "ログイン: system-admin@example.com / password1234"
