# my-home-dashboard

自宅向けのダッシュボードです。
生活に必要な各種情報を一覧で確認できます。

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

## 開発環境

VSCode の[拡張機能 Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers) を利用してコンテナ内で開発します。

```mermaid
flowchart TB
  subgraph local
    vscode(Visual Studio Code)
    code([ソースコード])
    browser([ブラウザ])

    subgraph dev-container
      commands([node, npm, etc..])
      vscode-server
      code-copy([ソースコード])
      dev-server(dashboard)
      electricity-fetcher
      gas-fetcher
    end

    subgraph db-container
      db[(database)]
    end

    subgraph migration-container
      migrate-tool
      ddl([DDL])
    end
  end

  code -. マウント ..-> code-copy
  vscode -- 起動 ---> dev-container
  vscode -- 起動 ---> db-container
  vscode -- 起動 --> migration-container
  vscode -- 連携 ---- vscode-server
  vscode-server -- 編集 --> code-copy
  code-copy -- "npm run dev" --> dev-server
  code-copy -- "npm run dev" --> electricity-fetcher
  code-copy -- "npm run dev" --> gas-fetcher
  dev-server -- Webページ --> browser
  ddl --> migrate-tool -- 作成 --> db
```

### 構築手順

1. 下記を参考に VSCode と DevContainers をインストール
   - [Developing inside a Container / Installation](https://code.visualstudio.com/docs/devcontainers/containers#_installation)
2. リポジトリをローカル環境に Clone
3. Clone したリポジトリを VSCode の DevContainers で開く
4. 開発対象サービスに合わせてセットアップ
   - dashboard
     ```
     cd dashboard
     npm install
     npm run dev
     # http://localhost:3000 でアクセス可能
     ```

## 本番サーバーでの起動方法

```
docker compose up -d
# http://localhost:80 でアクセス可能
```
