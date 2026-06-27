# links-quiz（フロントエンド）

社員紹介クイズアプリのフロントエンドです。

## 技術スタック

- React + TypeScript（Vite）
- Firebase Hosting（ホスティング）
- Google Identity（認証）

## 認証フロー

1. Googleアカウントでサインイン（`cloud-platform` + `spreadsheets.readonly` スコープ）
2. OAuthアクセストークンを取得
3. IAM Credentials API経由でCloud Run用のIDトークンを発行
4. APIリクエスト時に `Authorization: Bearer <IDトークン>` と `X-User-Token: <OAuthトークン>` を付与

## 開発

```bash
npm install
npm run dev
```

ローカルでは `http://localhost:8080` のバックエンドに接続します。

## デプロイ

`master` ブランチへのpushでGitLab CIが自動実行し、Firebase Hostingにデプロイされます。

```
GitLab CI → WIF認証 → firebase deploy --only hosting
```
