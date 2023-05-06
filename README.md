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
4. 開発用 DB をセットアップ
   - DB インスタンスは自動で生成されるため、スキーマ最新化のみ実施すればよい。
     - 手順は開発用 DB の DB 操作を参照
5. 開発対象サービスに合わせてセットアップ
   - dashboard
     ```
     cd dashboard
     npm install
     npm run dev
     # http://localhost:3000 でアクセス可能
     ```

### 開発用 DB

#### DB 操作

各種 DB ツールで操作可能。
接続情報は[.env](.env)を参照。

スキーマ操作は以下の手順を参考に migration コンテナ経由で行うこと。

1. docker コマンドを使用可能なターミナル上で [makefile](./makefile) の配置ディレクトリを開く
2. make コマンドを使用して DB 操作を行う
   ```
   # スキーマの最新化
   make migrate-up
   # スキーマのバージョンアップ
   make migrate-up-one
   # スキーマのバージョンダウン
   make migrate-down-one
   # スキーマのバージョン確認
   make migrate-version
   ```

#### DDL の追加

1. docker コマンドを使用可能なターミナル上で [makefile](./makefile) の配置ディレクトリを開く
2. make コマンドを使用して DDL のテンプレートを生成（ `{name}` は DDL の名称に置き換えること）
   ```
   make name={name} migrate-create
   ```
3. [ddl フォルダ](./migration/ddl/)に生成されたテンプレートに DDL を記載しコミットする
   - バージョンアップ用とバージョンダウン用の 2 種類のファイルが生成されるため、それぞれに記載すること

### 開発環境の削除

docker コマンドを使用可能なターミナル上で下記のコマンドを実行すれば削除可能。

```
# 開発用DB以外を削除
docker compose -f docker-compose-development.yaml down --rmi all --remove-orphans
# 開発用DBも削除したい場合
docker compose -f docker-compose-development.yaml down --rmi all --remove-orphans --volumes
```


## 本番サーバーでの起動方法

1. [GitHub のアクセストークンを取得](https://github.com/settings/tokens)してファイル `GITHUB_TOKEN.txt` に保存する
2. 以下のコマンドを実行

   ```
   # dockerでGitHub Container Registryにログイン
   cat GITHUB_TOKEN.txt | docker login ghcr.io -u {{ユーザー名}} --password-stdin

   # 各種サービスを起動
   docker compose -f docker-compose-production.yaml up -d

   # http://localhost:80 でアクセス可能
   ```
