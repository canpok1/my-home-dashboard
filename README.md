# my-home-dashboard

自宅向けのダッシュボードです。
生活に必要な各種情報を一覧で確認できます。

開発用ドキュメントを配置しています。

- [スキーマ定義](database/README.md)
- カバレッジ
  - [fetcher](coverage/fetcher/lcov-report/index.html)
  - [lib](coverage/lib/lcov-report/index.html)

```mermaid
flowchart TB
  subgraph local
    vscode(Visual Studio Code)
    code([ソースコード])
    ddl([DDL])
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

    subgraph migrate-container
      migrate([migrate])
      ddl-copy([DDL])
    end
  end

  code -. マウント ..-> code-copy
  vscode -- 起動 ---> dev-container
  vscode -- 起動 ---> db-container
  vscode -- 起動 --> migrate-container
  vscode -- 連携 ---- vscode-server
  vscode-server -- 編集 --> code-copy
  code-copy -- "npm run dev" --> dev-server
  code-copy -- "npm run dev" --> electricity-fetcher
  code-copy -- "npm run dev" --> gas-fetcher
  dev-server -- Webページ --> browser
  ddl -. マウント .-> ddl-copy
  ddl-copy -- migrate up --> db
```
