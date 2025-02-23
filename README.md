# `git clone && pnpm install` の後に実行する事 👇️

### 🖊️ 環境変数の設定

- .env.postgresql の作成と編集
- .env.production の作成と編集

### 🐎 下準備

```pwsh
pnpm run tsc
pnpm run api:geoUp
pnpm run api:postalUp
```

## 🔋 本番サーバーの設置

```pwsh
pnpm run build
pnpm run rollout
```
