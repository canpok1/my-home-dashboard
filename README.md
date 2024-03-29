# my-home-dashboard

自宅向けのダッシュボードです。
生活に必要な各種情報を一覧で確認できます。

- [開発環境について](docs/README_for_development.md)
- [本番環境について](docs/README_for_production.md)
- [その他ドキュメント（github pages参照）](http://ktnet.info/my-home-dashboard/)

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
      fetcher
    end
  end

  electricity([電気料金サイト])
  gas([ガス料金サイト])

  dashboard -- 一覧画面 --> browser
  db -- 各種料金情報 --> dashboard
  electricity -- 電気料金情報 --> fetcher
  gas -- ガス料金情報 --> fetcher
  fetcher -- ガス/電気料金情報 --> db
```
