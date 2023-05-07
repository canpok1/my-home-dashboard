# my-home-dashboard

自宅向けのダッシュボードです。
生活に必要な各種情報を一覧で確認できます。

- [開発環境について](doc/README_for_development.md)
- [本番環境について](doc/README_for_production.md)
- [スキーマ定義](doc/database/README.md)

## 構成図

```mermaid
flowchart TB
  subgraph local
    browser([ブラウザ])
  end

  subgraph server
    subgraph container1
      dashboard
    end
    subgraph container2
      db[(database)]
    end
    subgraph container3
      electricity-fetcher
    end
    subgraph container4
      gas-fetcher
    end
  end

  electricity([電気料金サイト])
  gas([ガス料金サイト])

  dashboard -- 一覧画面 --> browser
  db -- 各種料金情報 --> dashboard
  electricity -- 電気料金情報 --> electricity-fetcher -- 電気料金情報 --> db
  gas -- ガス料金情報 --> gas-fetcher -- ガス料金情報 --> db
```
