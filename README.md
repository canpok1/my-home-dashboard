# my-home-dashboard

自宅向けのダッシュボードです。
生活に必要な各種情報を一覧で確認できます。

## 環境構築

```
cd dashboard
npm install
```

## サービス起動

### 本番用

```
docker compose up -d dashboard
# http://localhost:80 でアクセス可能
```

### 開発用

```
cd dashboard
npm run dev
# http://localhost:3000 でアクセス可能
```
