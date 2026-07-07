# Detwiler Tech — 需求文档 (REQUIREMENTS)

> B2B 线缆与连接产品独立站
> 最后更新: 2026-06-16

---

## 1. 背景与目标

### 1.1 业务背景
公司主营线缆与连接产品(XLPE 电力电缆、光纤光缆、Cat6/Cat6A 网络线、太阳能直流电缆等),产品供应国内外 B2B 客户(电信运营商、电力工程商、贸易商、集成商)。当前需要一个独立站,用来:
- 集中展示产品矩阵
- 接收国际客户的询盘
- 建立品牌信任(认证、产能、合规)

### 1.2 参考站点
| 站点 | 借鉴点 |
|---|---|
| https://www.behpex.com/ | B2B 询盘流、Hero 区块、支付方式展示、CTA 编排 |
| https://www.cobtel.com/ | 产品分类层级(RJ45 / Keystone / Patch Cord / Optical)、产品详情页结构、图片采集源 |

### 1.3 业务目标
1. **流量承接**:Google / 行业目录 → 独立站 → 询盘,转化线索;
2. **询盘渠道统一**:表单 / 邮件 / WhatsApp 三路汇总到 CRM;
3. **品牌国际化**:中英双语 + 多币种,匹配欧美 / 拉美 / 中东 / 东南亚客户;
4. **可运营**:产品由运营在 CMS 后台管理,无需改代码。

---

## 2. 用户与场景

### 2.1 目标用户
| 角色 | 来源 | 关注点 |
|---|---|---|
| 海外采购 / 贸易商 | Google 搜索、B2B 平台 | 规格、MOQ、FOB 价格、认证、Lead time |
| 国内分销 / 工程商 | 行业展会、推荐 | 价格、库存、交期、定制化 |
| 弱网 / WhatsApp 用户 | 移动端 | 一键发起 WhatsApp 询盘 |

### 2.2 关键场景
- 场景 A:客户从 Google 进入产品详情 → 阅读规格 → 点击"立即询盘"→ 填表 → 收到销售邮件
- 场景 B:客户在产品页直接点 WhatsApp 按钮 → 预填产品/SKU/链接 → 与销售即时沟通
- 场景 C:客户切换语言(中↔英)→ 整站翻译 + 货币切换 → 价格区间重排
- 场景 D:运营在 `/admin` 后台上传新产品、修改首页 Featured 列表

---

## 3. 功能需求

### 3.1 P0 — 核心(MVP,首期上线)

#### 3.1.1 首页
- Hero 大图 + 标题 + 双 CTA(浏览产品 / 立即询价)
- 核心产品展示(4–8 张,运营在 CMS 配置 `featured=true`)
- 4 项核心优势(认证 / OEM / 快速交付 / 全天候支持)
- 支付方式展示(货到付款高亮,其他 6 种标"Coming Soon")
- CTA 区块(准备开启项目)

#### 3.1.2 产品中心
- 列表页 `/[locale]/products`:
  - 按分类筛选(Power Cable / Fiber Optic / Network / Solar / ...)
  - 关键字搜索(产品名 / SKU)
  - 卡片视图(图片、SKU、分类、简短描述)
- 详情页 `/[locale]/products/[slug]`:
  - 多图轮播(主图 + 缩略图 4–6 张)
  - 关键参数卡(MOQ / Lead Time / Origin)
  - 三大询盘入口:**立即询盘表单**、**邮件询盘**、**WhatsApp**
  - 完整描述(富文本)
  - 规格参数表
  - 相关产品(同分类)
  - JSON-LD `Product` 结构化数据

#### 3.1.3 询盘
- 字段:姓名、公司、邮箱、电话/WhatsApp、国家、预计数量、需求详情(必填)、产品(自动填充)、来源(自动)、UTM(自动)、IP / UA(自动)
- 提交后:写入 Payload Inquiries 集合 + 触发 Resend 邮件给销售 + 浏览器侧 Toaster 提示
- 反垃圾:Cloudflare Turnstile(可配置,无 key 时跳过校验)

#### 3.1.4 联系页
- 5 项联系信息(地址 / 电话 / 邮箱 / WhatsApp / 营业时间)
- 询盘表单(同产品页表单,产品字段留空)
- 大号 WhatsApp CTA 按钮

#### 3.1.5 多语言
- 路径式 i18n(`/en/...` / `/zh/...`),默认重定向到 `/en`
- UI 文案(按钮、菜单、提示):`src/i18n/messages/{en,zh}.json`
- 产品内容:Phase 1 简中↔英同文占位;Phase 2 由 CMS 后台管理多语言字段

#### 3.1.6 货币
- 默认 USD,可切换 CNY / EUR / GBP
- 货币偏好存 Cookie,7 天有效
- 后续接真实价格时,Header 显示当前货币

### 3.2 P1 — 上线后补齐
- 新闻 / 博客(`/[locale]/news`)
- 解决方案页(`/[locale]/solutions`)
- 产品 PDF 规格书下载(上传到 Payload media)
- 邮件模板美化(React Email 组件)
- Sitemap / Robots 自动化
- Sentry 错误监控
- Lighthouse 性能优化(图片 lazy、WebP/AVIF)

### 3.3 P2 — 商业化
- 支付接入(Stripe / PayPal / 阿里支付)
- 客户登录 / 询价单历史
- 报价单 PDF 生成
- 数据分析(Plausible / GA4)

---

## 4. 非功能需求

| 维度 | 指标 |
|---|---|
| 性能 | LCP < 2.5s(3G),TBT < 200ms,JS Bundle 路由级 < 200KB |
| SEO | 100% 关键页有独立 title/description/OG;sitemap.xml 自动更新;产品页 JSON-LD |
| 国际化 | UI 双语;价格 / 货币按 locale 格式化 |
| 可访问性 | WCAG 2.1 AA;键盘可达;对比度合规 |
| 安全 | HTTPS 强制;Turnstile 防垃圾;Server Action 输入校验;无 XSS 注入面 |
| 可维护性 | TypeScript 严格模式;Payload 后台自助运营;无 GitOps 即可上新 |
| 部署 | Vercel / Cloudflare Pages / 自有 Docker 均可;首推 Vercel + Postgres |

---

## 5. 技术栈

| 类别 | 选型 | 理由 |
|---|---|---|
| 框架 | **Next.js 15 (App Router) + React 19** | SSR/ISR/Edge 灵活,SEO 友好,Payload 官方适配 |
| 语言 | **TypeScript 5.6+** | 类型安全;Payload 自动生成类型 |
| 样式 | **Tailwind CSS 3.4 + shadcn/ui + Radix** | 体积小、可控、类名清晰 |
| 国际化 | **next-intl 3.x** | 路径式路由,SSR 友好,与 App Router 深度集成 |
| CMS | **Payload CMS 3.20** | 自托管、TypeScript-first、与 Next.js 同仓 |
| 数据库 | 开发 SQLite / 生产 PostgreSQL | 零配置起步,生产可平迁 |
| 富文本 | **Lexical** | Payload 默认;高性能;可序列化 |
| 表单 | **react-hook-form + zod** | 类型安全 + 体积小 |
| 邮件 | **Resend + @react-email/components** | 海外送达率高;模板组件化 |
| 邮件(国内) | 阿里云 DirectMail | 阿里云触发,国内送达稳 |
| 反垃圾 | **Cloudflare Turnstile** | 隐私友好,无 cookie |
| 抓取 | **Playwright 1.48** | 跨站渲染;以防目标站是 SPA |
| 部署 | Vercel(推荐) / 自托管 Docker | 见 `Dockerfile` |
| 监控 | Sentry(可选) | — |

---

## 6. 信息架构与路由

```
/                                          → 重定向到 /en
/en                                        首页
/en/products                               产品中心(全部分类)
/en/products/category/[category]           产品中心(按分类)
/en/products/[slug]                        产品详情
/en/about                                  关于我们
/en/contact                                联系我们
/en/news (P1)                              新闻
/en/solutions (P1)                         解决方案
/zh/...                                    同上(中文)

/admin                                     Payload 后台
/admin/api/graphql                         Payload GraphQL
/api/inquiries                             询盘提交 API route
/api/products                              产品数据 JSON(可选)
```

---

## 7. 目录结构

```
detwilertech/
├── data/                          # 产品/分类静态 JSON(本地素材)
│   ├── products.json
│   └── categories.json
├── public/
│   ├── products/                  # 产品图(由用户从 COBTEL 拉取)
│   ├── media/                     # 其它素材(banner、logo、证书)
│   ├── logo.jpg
│   └── robots.txt                 # SEO
├── scripts/
│   ├── scrape-cobtel.mjs          # 产品抓取脚本(已修复选择器)
│   ├── inspect-*.mjs              # 临时探针(可选保留)
│   └── seed-products.mjs          # 同步 data/ 到 Payload
├── src/
│   ├── app/
│   │   ├── (payload)/             # Payload admin & API
│   │   ├── [locale]/              # 用户端(i18n)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── products/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── category/[category]/page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── about/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   └── not-found.tsx
│   │   ├── api/
│   │   │   └── inquiries/route.ts # 询盘提交端点
│   │   ├── sitemap.ts             # 自动 sitemap
│   │   ├── robots.ts              # 自动 robots
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── collections/               # Payload 集合
│   │   ├── Users.ts
│   │   ├── Media.ts
│   │   ├── Categories.ts
│   │   ├── Products.ts
│   │   ├── Inquiries.ts
│   │   └── Settings.ts
│   ├── components/
│   │   ├── ui/                    # shadcn 组件
│   │   ├── layout/                # Header / Footer / LangSwitcher / CurrencySwitcher
│   │   ├── home/                  # 首页区块
│   │   ├── inquiry/               # InquiryForm / InquiryActions
│   │   └── product/               # ProductCard / ProductGallery / ProductSpecs
│   ├── i18n/
│   │   ├── routing.ts
│   │   ├── request.ts
│   │   ├── currency.ts            # 货币配置 & 格式化
│   │   └── messages/{en,zh}.json
│   ├── lib/
│   │   ├── env.ts                 # zod 校验
│   │   ├── utils.ts
│   │   ├── payment-methods.ts
│   │   ├── placeholder-products.ts
│   │   ├── products.ts            # 统一数据源(优先 Payload, fallback JSON)
│   │   └── seo.ts                 # 站点级 SEO 工具
│   ├── payload.config.ts
│   └── middleware.ts
├── .env / .env.example
├── docker-compose.yml
├── Dockerfile
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── README.md
├── SETUP.md
└── REQUIREMENTS.md                ← 本文档
```

---

## 8. 已实现细节(本轮交付)

> 状态日期: 2026-06-16
> 当前数据: **218 个 COBTEL 真实产品 + 8 个分类** 已落 `data/products.json`,前端可直接消费。

### 8.1 产品数据层架构
- **数据源**: `public/products/*.jpg` → `scripts/scan-products.mjs` 扫描 → 写入 `data/products.json` + `data/categories.json`
- **统一访问**: `src/lib/products.ts` 暴露 `getAllProducts / getProductBySlug / getProductsByCategory / getCategoryBySlug / getRelatedProducts / searchProducts / getFeaturedProducts / clearProductCache`
- **字段容错**: 缺 `moq` / `leadTime` / `origin` / `featured` / `description` / `images` 时自动补默认(`Negotiable` / `Shenzhen, China` / 占位图),组件层不用散落 `??`
- **JSON vs Payload 优先级**: 当前以 JSON 为主,Phase 3 接 Payload 后切换读取顺序即可
- **缓存**: 进程级 `_cache` 一次读取,生产期如需更新可调 `clearProductCache()`

### 8.2 COBTEL 抓取工作流
1. 用户运行 `npm run scrape:cobtel`(已修复选择器:`.products-list-box` / `.LiLevel2 a` / `.prodetails-name` / `#gallery .swiper-slide img`)
2. 抓取脚本下载图片到 `public/products/cobtel-*.jpg`
3. 用户或运营执行 `node scripts/scan-products.mjs` 重新生成 `data/products.json`
4. 重启 dev server(下一步:接 file watcher 自动 reload)

### 8.3 询盘三入口
| 入口 | 实现 | 备注 |
|---|---|---|
| 表单 | `POST /api/inquiries` → 写 `data/inquiries.json` + Resend 邮件 + Payload(待切) | 注入 IP / UA / UTM,失败有红色提示 |
| 邮件 | `mailto:` 链接,预填主题(SKU)+ 正文(FOB/MOQ/Lead time 模板) | 0 服务端开销 |
| WhatsApp | `wa.me/{number}` 链接,预填文本 | 跨端可点 |

- API 路由文件: `src/app/api/inquiries/route.ts`
- 数据规范化: `src/lib/inquiry-store.ts`(`validateInquiry` + `normalize`)
- 邮件 HTML 模板: 内联,包含全部字段表格 + 消息原文 + 回邮链接
- **失败兜底**: 没有 Resend key 时,记录落 JSON 即可,控制台打印跳过;不会因为邮件失败而拒收

### 8.4 多语言与货币
- **语言**: next-intl 路径式(`/en/...` / `/zh/...`),middleware 跳过 `/admin` `/api` `/_next`
- **货币**:
  - 配置文件 `src/i18n/currency.ts`(USD/CNY/EUR/GBP,默认 USD)
  - 客户端 `CurrencySwitcher` 组件,Cookie `dt_currency` 存 7 天
  - Cookie 变化触发 `dt:currency-changed` 自定义事件
  - `PriceTag` 组件订阅事件实时重渲染
  - 静态汇率示例(USD→CNY 7.25, EUR 0.92, GBP 0.79);生产应接实时 API
  - `Intl.NumberFormat` 按 locale 格式化(USD→en-US, CNY→zh-CN, EUR→de-DE, GBP→en-GB)

### 8.5 SEO
- `src/app/robots.ts` — 自动 `/robots.txt`,屏蔽 `/admin` `/api` `/_next`
- `src/app/sitemap.ts` — 覆盖 218 产品 × 2 语言 + 8 分类 × 2 + 4 静态页 = 468 条 URL
- 首页 `next/script`(Organization + WebSite)和产品详情(Product)三处 JSON-LD
- 产品详情 `generateMetadata()` 输出 `title` / `description` / `og:image`
- 自定义 `not-found.tsx`(404 友好页 + 双 CTA)
- **⚠️ 已知坑**:React 19 + Next.js 15 禁止 body 里用裸 inline `<script dangerouslySetInnerHTML>`,会触发 hydration 失败并把整页 unmount(出现"页面闪一下就空白")。所有 JSON-LD 一律用 `import Script from 'next/script'` + `strategy="afterInteractive"` + `id` + `dangerouslySetInnerHTML`。

### 8.6 验证(本轮)
- `npx tsc --noEmit` → **0 错误**
- `npx next build` → **468 页面全部生成**
- Playwright 4 路由全 0 console error:`/en` `/zh` `/en/products` `/en/contact` 都能正确渲染(已修 React 19 JSON-LD hydration bug)
- dev server 14 条关键路径全 200/307:
  - `/`, `/en`, `/zh`
  - `/en/products`, `/zh/products`
  - `/en/products/{cobtel-slug}`(多个)
  - `/en/products/category/{slug}`(多个)
  - `/en/contact`, `/zh/contact`
  - `/sitemap.xml`, `/robots.txt`
  - `/api/inquiries` GET 200, POST 200(落盘验证)

---



### 8.1 Product
| 字段 | 类型 | 必填 | 多语言 | 说明 |
|---|---|---|---|---|
| name | text | ✅ | ✅ | 产品名 |
| sku | text | ✅ | ❌ | 唯一 |
| slug | text | ✅ | ❌ | 唯一,URL 标识 |
| category | relationship → categories | ✅ | ❌ | 单分类 |
| shortDescription | textarea | | ✅ | 列表卡片用 |
| description | richText | | ✅ | 详情页用 |
| specifications | array(key, value) | | ✅ | 规格表 |
| images | array(upload, isPrimary) | ✅(≥1) | ❌ | |
| datasheet | upload | | ❌ | PDF |
| moq | text | | ✅ | 最小起订量 |
| leadTime | text | | ✅ | 交货期 |
| origin | text | | ✅ | 产地 |
| featured | checkbox | | ❌ | 首页展示 |
| order | number | | ❌ | 排序权重 |
| meta.title / description | | | ✅ | SEO |

### 8.2 Category
| 字段 | 类型 | 说明 |
|---|---|---|
| name (en/zh) | text × 2 | 双语 |
| slug | text | URL 标识 |
| description | textarea | 分类介绍 |
| order | number | 排序 |
| cover | upload | 分类封面图 |

### 8.3 Inquiry
| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| subject | text | ✅ | 自动生成 |
| product | relationship → products | | 关联产品 |
| name | text | ✅ | |
| company | text | | |
| email | email | ✅ | |
| phone | text | | |
| country | text | | |
| quantity | text | | |
| message | textarea | ✅ | |
| source | select | | form / email / whatsapp / contact-page |
| status | select | | new / in_progress / replied / closed / lost |
| notes | textarea | | 内部备注 |
| locale | select | | en / zh |
| utm_source/medium/campaign | text | | UTM 追踪 |
| ip | text | | 自动 |
| userAgent | text | | 自动 |
| createdAt / updatedAt | | | 时间戳 |

---

## 9. 关键设计原则

1. **数据优先 Payload,降级 JSON**:`lib/products.ts` 优先读 Payload,失败/未配置时读 `data/products.json` 与 `placeholder-products.ts`,这样开发期和早期上线都不阻塞。
2. **静态资源就近**:`public/products/` 存图,Next/Image 直出,Phase 2 切到 Payload media + CDN。
3. **询盘三入口等价**:表单 = 邮件 = WhatsApp,任一入口都能在 24h 内反馈,统一在 Payload 后台管理。
4. **货币与语言解耦**:语言走 next-intl 路径,货币走 Cookie + localStorage,二者互不干扰。
5. **CMS 字段本地化 + next-intl UI 本地化协作**:Payload 字段用 `localized: true`(内容),next-intl 处理 UI 文案(界面)。

---

## 10. 验收清单(MVP)

- [x] 访问 `/` 自动 302 到 `/en`(默认) ✅
- [x] `/en` 与 `/zh` 整站可切换,URL 前缀同步 ✅
- [x] 首页 Hero / 核心产品 / 优势 / 支付 / CTA 5 个区块显示 ✅
- [x] `/products` 显示分类卡片 + 全部产品网格 ✅
- [x] `/products/category/[slug]` 列出该分类下产品 ✅
- [x] `/products/[slug]` 详情页:多图、规格表、相关产品、3 询盘入口 ✅
- [x] 点击"立即询盘"弹窗填表 → 提交 → 看到成功提示 → 落 `data/inquiries.json`(后台 `/admin` Payload 接入待办) ✅
- [x] 邮件询盘唤起默认邮件客户端,主题与正文预填 ✅
- [x] WhatsApp 唤起 web.whatsapp.com,文本预填产品名/SKU/链接 ✅
- [x] `/contact` 5 项联系信息 + 表单 + WhatsApp 大按钮 ✅
- [x] Header 货币切换(USD/CNY/EUR/GBP),刷新保留 ✅
- [x] 移动端汉堡菜单可弹出,Header 联系信息折入底部条 ✅
- [x] `/admin` 输入邀请码 / 首次创建账号 → 登录后看到 Inquiries 列表(集合已建,首次访问引导注册) ✅
- [x] `npm run build` 0 错误(468 页面生成) ✅
- [x] `npm run typecheck` 0 错误 ✅

---

## 11. 风险与对策

| 风险 | 影响 | 对策 |
|---|---|---|
| COBTEL 反爬,产品抓取不完整 | 产品数量不足 | 已有 ~20 张图先上线,人工补;Phase 2 切到 CMS 录入 |
| Resend 配额 / 送达率 | 询盘邮件丢失 | 关键客户配阿里云 DirectMail 兜底,本地日志 + Sentry 告警 |
| 多语言文案同步 | 漏翻译 | 在 CMS 加 `translationStatus` 字段;UI 文案由开发维护 |
| 性能 | LCP 不达标 | 全部图走 next/image + 懒加载,字体 subset |
| SEO 收录慢 | 无自然流量 | 提交 sitemap 到 GSC;B2B 平台反链 |

---

## 12. 路线图

| 阶段 | 周期 | 内容 |
|---|---|---|
| Phase 0 | ✅ | 准备(账号、域名、邮箱、WhatsApp 商务号) |
| Phase 1 | ✅ | 项目骨架 + 首页 + 多语言 |
| Phase 2 | ✅ | 产品中心 + 询盘表单(已完成,218 产品已上架) |
| Phase 3 | 🔄 | CMS 后台 + 邮件模板 + 数据回流(Inquiries 集合已就位,产品切 Payload 待办) |
| Phase 4 | ⏳ | SEO / 性能 / 部署上线(sitemap/robots/JSON-LD 已完成,Vercel/Docker 待选) |
| Phase 5 | 🔌 | 支付集成(按需启用) |

---

## 13. 协作与维护

- **代码 owner**:Frontend
- **运营 owner**:Sales / Marketing
- **CMS 后台地址**:`/admin`(生产域名待定)
- **每日询盘 review**:销售在 `/admin` → Inquiries 处理
- **每周更新**:Featured 列表 / 新品上架 / 库存状态
- **每月 review**:Core Web Vitals / 询盘转化率 / 自然搜索关键词

---

## 14. 变更记录

| 日期 | 变更 | 原因 |
|---|---|---|
| 2026-06-16 | 初版 | 项目启动,整合 behpex + cobtel 双向参考 |
