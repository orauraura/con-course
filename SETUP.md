# Talknote セットアップ手順

## 1. Supabaseプロジェクトの作成

1. [supabase.com](https://supabase.com) でアカウント作成・ログイン
2. 「New project」でプロジェクト作成

## 2. データベーススキーマの適用

Supabaseダッシュボードの「SQL Editor」を開いて、
`supabase/schema.sql` の内容をコピー&ペーストして実行する

## 3. 環境変数の設定

Supabaseダッシュボードの「Settings > API」から以下を取得して `.env.local` に設定:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 4. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 にアクセス

## 機能一覧

- **認証**: メール/パスワードでのサインアップ・ログイン
- **タイムライン**: 全体への投稿・いいね・コメント・ファイル添付
- **グループチャット**: グループ作成・参加・リアルタイムメッセージ・ファイル共有
- **ダイレクトメッセージ**: 1対1リアルタイムチャット・既読表示・ファイル共有
- **プロフィール**: 表示名・自己紹介の編集
