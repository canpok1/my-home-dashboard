# 本番環境

## 起動方法

1. [GitHub のアクセストークンを取得](https://github.com/settings/tokens)してファイル `GITHUB_TOKEN.txt` に保存する
2. 以下のコマンドを実行

   ```
   # dockerでGitHub Container Registryにログイン
   cat GITHUB_TOKEN.txt | docker login ghcr.io -u {{ユーザー名}} --password-stdin

   # 各種サービスを起動
   docker compose -f docker-compose-production.yaml up -d

   # http://localhost:80 でアクセス可能
   ```
