# Chat Lite

Slack に近い**簡易チームチャット**の MVPです。複数ワークスペース・公開チャンネル・メンバー同士の 1対1 DM・招待リンクがあり、サーバーレス向けには **定期的なフェッチによるメッセージ同期**（WebSocket は使わない）で動きます。

| 構成 | 技術 |
|------|------|
| フレームワーク | Next.js 16（App Router）・React 19 |
| 認証 | NextAuth.js v4（Credentials + JWT） |
| DB | PostgreSQL（Prisma 6） |

## 必要な環境変数

[`.env.example`](.env.example) を `.env` にコピーし、値を埋めます。

- **`DATABASE_URL`** — Postgres の接続文字列（TLS が必要なホストでは `?sslmode=require` など）
- **`NEXTAUTH_SECRET`** — ランダムな長い文字列（例: `openssl rand -base64 32`）
- **`NEXTAUTH_URL`** — 本番では `https://あなたのドメイン`、ローカルでは `http://localhost:3000`

## ローカル開発

```bash
cp .env.example .env
# .env に DATABASE_URL などを記入
npm install
npx prisma migrate deploy   # DB にスキーマを適用（初回）
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開き、**ユーザー登録**から最初のワークスペースと `#general` チャンネルが自動作成されます。

## 本番ビルド・Vercel 向けメモ

- `npm run build` は **`prisma generate` → `prisma migrate deploy` → `next build`** の順で実行します。**ビルド時に接続できる PostgreSQL が必須**です（環境変数 `DATABASE_URL`）。
- Neon など PgBouncer 利用時は Prisma の [接続ドキュメント](https://www.prisma.io/docs/orm/overview/databases/neon)に従い、必要なら `directUrl` を追加してください。
- Vercel では **環境変数**に `DATABASE_URL`・`NEXTAUTH_SECRET`・`NEXTAUTH_URL`（本番の絶対 URL）を設定してからデプロイします。
- リアルタイムは **約 2.5 秒間隔のポーリング**です。恒久 WebSocket が必要になった場合は別サービス連携への拡張を想定しています。

### Vercel ビルドが `P3009`（migration failed）で止まる場合

初回デプロイでマイグレーション SQL が失敗した場合、DB の `_prisma_migrations` に **失敗状態**が残り、以降のビルドが **`migrate deploy` で止まる**ことがあります（BOM のほかにも起こりえます）。

本プロジェクトの `npm run build` は、ビルド中に **`P3009` を検出すると `20260516040000_init` を一度 `migrate resolve --rolled-back` で解消してから、`migrate deploy` をもう一度試す**（[`scripts/prisma-migrate-deploy.cjs`](scripts/prisma-migrate-deploy.cjs））処理を挟んでいます。通常は **Redeploy だけで復旧**します。

**空のデータベース / 開発用だけ切り替え可能**なら、DB を作り直すのが最短です。

同じデータベースを使い続ける場合は、`DATABASE_URL` を本番と同じ値にしたローカルの `.env` で次を実行し、失敗済みとしてマークしてから再デプロイします。

```bash
npx prisma migrate resolve --rolled-back "20260516040000_init"
```

その後、Vercel から **Redeploy** を実行すると `prisma migrate deploy` がマイグレーションを適用できるようになります。

## 主なルート

| パス | 説明 |
|------|------|
| `/signup`・`/login` | 登録・ログイン |
| `/w/[workspaceId]/channel/[channelId]` | チャンネル |
| `/w/[workspaceId]/dm/[peerUserId]` | DM |
| `/invite/[token]` | ワークスペースへの招待 |

## ライセンス

必要に応じて `LICENSE` を追加してください。
