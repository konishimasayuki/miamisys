# MIAMIシステム一括管理（Upstash連携版）

会社ごとにログイン → システム一覧（URL・ID・パスワード）を確認 → 画面上でシステムの追加・編集・削除ができるポータルです。
データはUpstash Redisに保存されるため、誰か1人が編集すると全員の画面に反映されます。

## 構成
- `index.html` … フロント（静的1ファイル）
- `api/data.js` … Vercel Functions。Upstash RedisにGET/SETするだけのAPI
- DBのSDKは使わず、Upstashの REST API を直接呼んでいるので依存パッケージなし

## 事前準備：Upstashの作成
1. https://upstash.com にログイン（アカウントがなければ無料登録）
2. 「Create Database」→ Redisを選択、リージョンは東京(ap-northeast-1)推奨
3. 作成後の画面にある **REST API** セクションから以下2つをコピー
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

## デプロイ手順（GitHub → Vercel）
1. このフォルダ一式（`index.html` / `api/data.js` / `package.json`）をGitHubリポジトリにpush
2. Vercelで「Import Project」→ 対象リポジトリを選択
3. Framework Presetは「Other」のままでOK（Build Command / Output Directoryは空欄）
4. **Environment Variables** に以下を追加
   - `UPSTASH_REDIS_REST_URL` = Upstashでコピーした値
   - `UPSTASH_REDIS_REST_TOKEN` = Upstashでコピーした値
5. Deploy

初回アクセス時にデータが無ければ、現在登録済みの内容（システム名・URL・ID・パスワード）が自動でUpstashに書き込まれます。

## 使い方
- トップ画面で会社を選んでパスワードを入力 → ログイン
- ログイン後、右上の「編集する」ボタンで編集モードに切り替え
  - 各カードの「システム名／URL／ID／パスワード」を直接書き換え可能
  - 「＋ 新しいシステムを追加」でカードを追加
  - 「このシステムを削除」で削除
  - 画面下の「変更を保存」を押すとUpstashに保存され、以後全員の画面に反映される
- 「編集を終了」で閲覧モードに戻る

## 注意事項（重要）
- このAPIには認証がありません。編集画面のボタンはUIとして用意していますが、URL(`/api/data`)を直接叩けば誰でもデータを書き換えられる状態です。社内限定・低リスク用途を前提とした簡易ツールとしてご利用ください。
- 会社を選ぶ際のログインパスワード自体（miami0383 など）は現状UI上からは編集できません。変更したい場合はUpstashのコンソールから `miami_portal_data` キーの中身を直接編集するか、`api/data.js` の `DEFAULT_DATA` を書き換えて再デプロイしてください（開発を依頼いただければ画面から変更できるようにもできます）。
