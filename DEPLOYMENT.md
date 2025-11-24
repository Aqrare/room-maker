# デプロイ手順（Vercel）

## Vercelへのデプロイが推奨される理由

- Next.jsの開発元が提供
- 自動ビルド・デプロイ
- 無料プランでも十分な機能
- 環境変数の簡単な設定
- カスタムドメイン対応

## デプロイ手順

### 1. Gitリポジトリの作成

まず、プロジェクトをGitリポジトリとして初期化します：

```bash
# Gitの初期化
git init

# .gitignoreの確認（既に作成済み）
# .env.local は .gitignore に含まれているので安全

# 最初のコミット
git add .
git commit -m "Initial commit: Room Layout Designer"
```

### 2. GitHubにプッシュ

1. [GitHub](https://github.com) で新しいリポジトリを作成
2. ローカルからプッシュ：

```bash
# リモートリポジトリを追加
git remote add origin https://github.com/YOUR_USERNAME/room-maker.git

# プッシュ
git branch -M main
git push -u origin main
```

### 3. Vercelアカウントの作成

1. [Vercel](https://vercel.com) にアクセス
2. GitHubアカウントでサインアップ

### 4. プロジェクトのインポート

1. Vercel ダッシュボードで「Add New」→「Project」
2. GitHubリポジトリから「room-maker」を選択
3. 「Import」をクリック

### 5. 環境変数の設定

**重要**: デプロイ前に環境変数を設定する必要があります。

1. 「Environment Variables」セクションで以下を追加：

```
NEXT_PUBLIC_FIREBASE_API_KEY=（あなたのAPIキー）
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=（あなたのAuth Domain）
NEXT_PUBLIC_FIREBASE_PROJECT_ID=（あなたのProject ID）
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=（あなたのStorage Bucket）
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=（あなたのSender ID）
NEXT_PUBLIC_FIREBASE_APP_ID=（あなたのApp ID）
```

2. すべての環境（Production, Preview, Development）にチェック

### 6. デプロイ

1. 「Deploy」ボタンをクリック
2. ビルドが完了するまで待機（2-3分）
3. デプロイ完了！URLが発行されます

## デプロイ後の確認

1. 発行されたURL（例: `https://room-maker.vercel.app`）にアクセス
2. アプリケーションが正常に動作することを確認
3. Firebaseへの保存・読み込みをテスト

## 自動デプロイ

GitHubにプッシュすると自動的にデプロイされます：

```bash
# コードを修正
git add .
git commit -m "Update: 機能追加"
git push

# 自動的にVercelがデプロイを開始
```

---

# Firebase Hostingでのデプロイ（代替方法）

Firebase Hostingも使用可能ですが、Next.jsの場合は設定が複雑です。

## 必要な手順

1. Firebase CLIのインストール
2. Next.jsの静的エクスポート設定
3. Firebase Hostingの設定

**注意**: Next.jsの一部機能（API Routes、Server-side Rendering）が使えなくなります。

そのため、**Vercelの使用を強く推奨**します。

---

# カスタムドメインの設定（オプション）

Vercelで独自ドメインを使用する場合：

1. Vercel ダッシュボードで「Settings」→「Domains」
2. カスタムドメインを追加
3. DNSレコードを設定（VercelがGUIで案内）

---

# トラブルシューティング

## ビルドエラー

環境変数が設定されているか確認してください。

## Firebaseエラー

1. Firebase Consoleで認証されたドメインを追加：
   - Firebase Console → Authentication → Settings → Authorized domains
   - Vercelのドメインを追加（例: `room-maker.vercel.app`）

2. Firestoreのセキュリティルールを確認

## 環境変数が反映されない

1. Vercelダッシュボードで環境変数を再確認
2. 「Redeploy」で再デプロイ
