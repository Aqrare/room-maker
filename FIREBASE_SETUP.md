# Firebase セットアップ手順

## 1. Firebase プロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: room-maker）
4. Google Analytics は任意で設定
5. プロジェクトを作成

## 2. Firebase Firestore の有効化

1. Firebase Console で「Firestore Database」を選択
2. 「データベースを作成」をクリック
3. テストモードで開始（後で本番モードに変更可能）
4. ロケーションを選択（例: asia-northeast1）

## 3. Web アプリの登録

1. プロジェクト設定（⚙️アイコン）を開く
2. 「アプリを追加」→ Web アイコン（</>）を選択
3. アプリのニックネームを入力
4. 「Firebase Hosting を設定」はチェック不要
5. 「アプリを登録」をクリック

## 4. 環境変数の設定

1. Firebase の設定情報をコピー
2. プロジェクトルートに `.env.local` ファイルを作成
3. `.env.local.example` の内容をコピーして実際の値を入力

```bash
# .env.local ファイルの例
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:XXXXXXXXXXXXXXXX
```

## 5. セキュリティルールの設定（推奨）

Firestore のセキュリティルールを設定して、データへのアクセスを制限します。

Firebase Console → Firestore Database → ルール

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 開発中はすべてのユーザーが読み書き可能
    match /rooms/{roomId} {
      allow read, write: if true;
    }

    // 本番環境では認証を追加することを推奨
    // match /rooms/{roomId} {
    //   allow read: if true;
    //   allow write: if request.auth != null;
    // }
  }
}
```

## 6. 開発サーバーの再起動

環境変数を読み込むため、開発サーバーを再起動します：

```bash
# 開発サーバーを停止（Ctrl+C）
# 再度起動
npm run dev
```

## 使い方

### 保存
1. 部屋と家具を配置
2. 「データの保存・読み込み」パネルの「保存」ボタンをクリック
3. 保存名を入力して保存

### 読み込み
1. 「読み込み」ボタンをクリック
2. 保存された部屋のリストから選択
3. 「読み込み」ボタンで復元

### 削除
1. 「読み込み」ダイアログで削除したい部屋の「削除」ボタンをクリック

## トラブルシューティング

### Firebase が設定されていません

`.env.local` ファイルが正しく作成されているか確認してください。

### データが保存されない

1. Firebase Console で Firestore Database が有効になっているか確認
2. セキュリティルールが正しく設定されているか確認
3. ブラウザのコンソールでエラーメッセージを確認

### 環境変数が読み込まれない

開発サーバーを再起動してください。
