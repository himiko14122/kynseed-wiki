# British Railway Wiki

Official wiki for **British Railway** (Roblox — Game ID 10082031223).

- Live site: https://british-railway.wiki
- Deploy: Cloudflare Workers Builds (Git integration) — v1.0.0
- Build: `corepack enable && pnpm install --frozen-lockfile && pnpm run build`

## 部署
Cloudflare Worker Static Assets + **CF 原生 Worker Builds Git 集成**（push main → 自动构建+部署）。
