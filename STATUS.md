# Detwiler Tech — 项目状态与下次接手指南

> **下次会话开头直接说「看 STATUS.md」**,我就会从这里接着干。
> 创建日期:2026-06-17 · 阶段:Phase 2 大部分完成,Phase 3 (Payload) 与 P0 部署项待启动

---

## 0. 一句话现状

**B2B 网站前后端骨架基本就绪,正在 dev server 上稳定运行 (`http://localhost:3000`)。**
前端可消费 218 个 COBTEL 产品,支持中英双语 + 4 货币切换,询盘三通道(表单/邮件/WhatsApp)落盘已通,SEO 基础(sitemap/robots/JSON-LD)已铺好。
**未启动的核心是 Payload CMS 数据通路**和**生产环境真实数据/邮件/反垃圾/部署**。

---

## 1. 已完成 ✅

| 类别 | 内容 |
|---|---|
| 数据 | 218 个 COBTEL 真实产品 + 8 分类,落 `data/products.json` / `data/categories.json` |
| 数据层 | `src/lib/products.ts` 统一访问(9 个 getter),缺字段自动补默认 |
| 国际化 | next-intl 路径式 `/en/...` / `/zh/...`,middleware 跳过 admin/api/_next |
| 货币 | USD/CNY/EUR/GBP,Cookie `dt_currency` 7 天,`Intl.NumberFormat` 按 locale 格式 |
| 产品页 | 列表 + 详情(多图轮播、规格表、相关产品、JSON-LD、generateMetadata) |
| 询盘 | 表单→`/api/inquiries` 落 `data/inquiries.json` + 异步邮件(已写 3 条) |
| 询盘 | 邮件 `mailto:` 预填主题/正文;WhatsApp `wa.me/` 预填文本 |
| SEO | sitemap (468 URL)、robots、JSON-LD(Org/WebSite/Product,改用 `next/script`) |
| 基础设施 | dev/build 缓存物理隔离(`.next-dev/` vs `.next/`),`dev-clean.js` 跨平台 |
| 校验 | Playwright 4 路由 0 console error;`npx tsc --noEmit` 0 错误;`next build` 成功 |

---

## 2. 未完成清单(按优先级)

### P0 — 上线前必须(否则不能上生产)

- [ ] **P0-1 · Payload CMS 数据通路** — `src/lib/products.ts` 当前只读 JSON。
  需实现 `getPayload()` 拉取(Products/Categories collections 已建),JSON 降级为 fallback。Phase 3 启动项。
  相关文件: `src/lib/products.ts`、`src/payload.config.ts`、`src/collections/Products.ts`、`src/collections/Categories.ts`
  提示: `payload.db` 已生成,表结构也有;`scripts/import-products.mjs` 写了导入脚本但需验证跑通。
- [ ] **P0-2 · 真实邮件服务** — `RESEND_API_KEY` 留空,询盘邮件实际不发。
  需用户在 `.env` 填入 Resend key(或国内改用 DirectMail,见 `.env.example`)。`src/app/api/inquiries/route.ts` 已有 Resend 调用,默认 key 缺失时 silently skip。
- [ ] **P0-3 · Cloudflare Turnstile 接线** — README 提了反垃圾,代码里没接。
  InquiryForm 没接 Turnstile 组件,后端 `/api/inquiries` 没验证 token。容易灌垃圾。
- [ ] **P0-4 · 真实公司信息** — `.env` 全是占位:
  - `NEXT_PUBLIC_SALES_EMAIL=sales@detwilertech.com` (占位)
  - `NEXT_PUBLIC_WHATSAPP_NUMBER=8613800000000` (占位)
  - `NEXT_PUBLIC_PHONE=+86-138-0000-0000` (占位)
  - `NEXT_PUBLIC_ADDRESS=Shenzhen, Guangdong, China` (占位)
  - `PAYLOAD_SECRET` 需换成 32 位随机
- [ ] **P0-5 · /admin 端到端验证** — 之前 i18n 块导致 500 已修,Payload 表也有;
  **但用户从未实际登录过 Payload 后台**。需要:起 dev → 访问 `/admin` → 用 env 里的 `PAYLOAD_SECRET` 派生 admin 用户登录 → 验证 Products/Inquiries CRUD。

### P1 — 体验/内容/数据补全(影响转化和 SEO)

- [ ] **P1-1 · MOQ / LeadTime / Origin 数据补全** — 218 个产品 0 个有 `moq` 字段。
  `lib/products.ts` 有 `?? '—'` 兜底,看起来不丑,但实际 B2B 客户看的就是「—」。
  需从 COBTEL 详情页补抓这些字段,或运营手动填进 Payload。
- [ ] **P1-2 · About 页面真实内容** — `src/app/[locale]/about/page.tsx` 还是占位 stats(50+/15+/1000+ 等)+ 通用段落。
  需替换为公司真实介绍、团队、工厂图片、认证证书。
- [ ] **P1-3 · 产品图 alt 文本** — 218 张 COBTEL 图都没有 alt。`ProductGallery` 没传 alt,SEO 和无障碍吃亏。
- [ ] **P1-4 · OG image** — `metadataBase` 设了但 `og:image` 引用文件不存在,社交分享会 broken。
- [ ] **P1-5 · Footer 真实链接** — JSON-LD `sameAs: []` 空数组;Footer 也没 LinkedIn/Facebook/YouTube 图标。
- [ ] **P1-6 · i18n 文案完整度** — `messages/{en,zh}.json` 有 9 个 namespace,基本通;
  但产品详情页技术参数表(`src/app/[locale]/products/[slug]/page.tsx`)可能还有英文字段名硬编码未 i18n。
- [ ] **P1-7 · 产品搜索/筛选增强** — 当前只有按分类;缺关键字搜索(已有 search box 但 UX 简单)、featured 筛选、排序(价格/上架时间)。
- [ ] **P1-8 · file watcher 自动 reload** — `REQUIREMENTS.md` 8.2 提的"接 file watcher 自动 reload"没做。
  目前改 `data/products.json` 后需手动重启 dev。

### P2 — 生产/部署/优化(等 P0 完成后)

- [ ] **P2-1 · Docker 化** — README 提了 Docker Compose,但 `Dockerfile` / `docker-compose.yml` 没写。
- [ ] **P2-2 · Vercel 部署** — Next.js 15 + Payload 在 Vercel 需要 Postgres + 上传转 S3,工作量大。
- [ ] **P2-3 · 真实汇率 API** — `src/i18n/currency.ts` 静态汇率(USD→CNY 7.25 / EUR 0.92 / GBP 0.79)。
  需接 exchangerate.host 或类似 API 每日刷新。
- [ ] **P2-4 · 分析工具** — Plausible / Google Analytics 都没接。
- [ ] **P2-5 · GDPR Cookie consent** — 既然支持 EUR,就要 cookie banner。
- [ ] **P2-6 · Lighthouse 跑分** — 未做性能/SEO/无障碍审计。
- [ ] **P2-7 · 阿里云 DirectMail 国内邮件** — `.env.example` 留了字段,代码没接。

---

## 3. 关键技术决策(防止下次踩坑)

### 3.1 dev / build 缓存物理隔离
- `next.config.mjs` 里 `distDir = process.env.NEXT_DIST_DIR || (prod ? '.next' : '.next-dev')`
- dev 用 `.next-dev/`,build 用 `.next/`,**互不污染**
- 历史教训:之前跑过 `next build` 把 `.next/` 改成生产产物,dev server 接着用就 `missing bootstrap script`,刷新就空白。已修复,**永远不要混用**。
- 启动 dev 走 `npm run dev:clean`(或双击 `dev-clean.bat`),不要直接 `npm run dev`。

### 3.2 React 19 + Next.js 15 禁止 body 内裸 inline `<script>`
- 错误信息: `Cannot render a <script> outside the main document without \`async={true}\` and a non-empty \`src\` prop.`
- 现象: hydration failed,整树 unmount → 页面闪一下就空白
- **正确做法**:所有 JSON-LD 一律用 `next/script`
  ```tsx
  <Script
    id="ld-xxx"
    type="application/ld+json"
    strategy="afterInteractive"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
  />
  ```
- 已修文件: `src/app/layout.tsx`、`src/app/[locale]/products/[slug]/page.tsx`

### 3.3 Payload 内置 i18n 与 next-intl 冲突
- `src/payload.config.ts` 里**不开启** Payload 的 i18n 块
- 字段多语言: collection 用 `localized: true`(已有)
- UI 文案: next-intl 处理
- 原因:开启会让 `/admin` 500,已验证。

### 3.4 数据层架构
- 当前: `data/products.json` 为主,`placeholder-products.ts` 兜底
- 目标: `getPayload({ collection: 'products' })` 为主,JSON 兜底
- 切换点: 改 `src/lib/products.ts` 顶部,加 try/catch 即可
- 缓存: 进程级 `_cache`,改了 JSON 调 `clearProductCache()`

### 3.5 货币切换 UX
- `CurrencySwitcher` 设置 Cookie + dispatch `dt:currency-changed` 事件
- `PriceTag` 订阅事件实时重渲染
- **坑**:Cookie 改了 SSR 不会重新计算(已经是 client-side 重渲染),所以 CurrencySwitcher 当前是"刷新页面让 SSR 重新计算"方案(`src/components/layout/CurrencySwitcher.tsx:42` 有 TODO),接实时价格时改局部 state。

---

## 4. 启动 dev server

```bash
# 干净启动(推荐)
npm run dev:clean         # 或双击 dev-clean.bat / 运行 bash dev-clean.sh

# 普通启动(可能因缓存错乱出 bug)
npm run dev
```

访问: `http://localhost:3000`

---

## 5. 关键文件位置速查

| 用途 | 路径 |
|---|---|
| 产品数据 | `data/products.json` (218) + `data/categories.json` (8) |
| 询盘数据 | `data/inquiries.json` (已存 3 条测试) |
| Payload DB | `data/payload.db` (SQLite,已有表) |
| 产品访问层 | `src/lib/products.ts` |
| 询盘 API | `src/app/api/inquiries/route.ts` |
| 询盘 store | `src/lib/inquiry-store.ts` |
| 货币配置 | `src/i18n/currency.ts` |
| 货币切换 | `src/components/layout/CurrencySwitcher.tsx` |
| 价格显示 | `src/components/product/PriceTag.tsx` |
| 产品图 | `src/components/product/ProductGallery.tsx` |
| 询盘 UI | `src/components/inquiry/InquiryActions.tsx` |
| JSON-LD | `src/app/layout.tsx` + `src/app/[locale]/products/[slug]/page.tsx` |
| SEO | `src/app/sitemap.ts` + `src/app/robots.ts` |
| Payload 配置 | `src/payload.config.ts` |
| Collections | `src/collections/{Products,Categories,Inquiries,Media,Settings,Users}.ts` |
| 启动脚本 | `scripts/dev-clean.js` + `dev-clean.{bat,sh}` |
| 需求文档 | `REQUIREMENTS.md` (主) + `STATUS.md` (本文件) |
| 设置文档 | `SETUP.md` (项目) |

---

## 6. 已存的"未来要做"标记(grep 出来的)

源码里被 `TODO` / `下一步` / `Phase X` 标记的位点,接班时一并扫一眼:

- `src/app/[locale]/products/[slug]/page.tsx:191` — PDF 下载按钮待接真实 PDF
- `src/collections/Inquiries.ts:14` — 销售角色按国家过滤询盘
- `src/components/layout/CurrencySwitcher.tsx:42` — 货币切换刷新页面方案待改
- `src/lib/payment-methods.ts:4-5` — Phase 5 支付集成
- `src/lib/placeholder-products.ts:2-3` — 标记为 Phase 1 临时
- `src/lib/products.ts:6` — 标记了 Phase 1 兼容 placeholder
- `scripts/import-products.mjs:121,189` — 占位结构 + 下一步提示

---

## 7. 对话记录保存位置

- 本次会话 jsonl transcript(完整原始对话)已**复制到项目内**:
  `D:\Tool\claude_web\detwilertech\docs\sessions\2026-06-17-detwilertech-phase2.jsonl` (2.0 MB, 936 行)
  用文本编辑器或 `jq` 可以翻,里面有本轮所有我和你说的原话、改的文件、跑的命令。
- 全局 memory(MEMORY.md)里已经存了「React 19 + Next.js 15 禁止 body inline script」这条规则,跨会话有效。
- 系统原始位置: `C:\Users\孙凯东\.claude\projects\C--WINDOWS-system32\017c290d-560b-4d3d-8f53-01ad75f2c8c3.jsonl`

---

## 8. 下次接手建议顺序

1. **先跑 `npm run dev:clean` 看能不能起** — 5 分钟验证环境 OK
2. **做 P0-1 (Payload 数据通路)** — 把 `lib/products.ts` 改成优先读 Payload,这是后续所有 P1 数据补全的基础设施
3. **做 P0-5 (/admin 端到端)** — 顺手验下 admin 能进能写
4. **做 P1-1 (MOQ 等数据补全)** — 跑 `scripts/import-products.mjs` 或者重新抓 COBTEL 详情
5. **做 P0-2 / P0-3 / P0-4 (真实信息 + 邮件 + Turnstile)** — 上线前必备
6. **P1 内容类(About / Footer / OG / alt)** — 跟运营/文案对接
7. **P2 部署与优化** — 等所有 P0/P1 完后再做

不建议做的:不要先优化 P2(部署/分析)再去补 P0,会卡在「数据没接好」。
