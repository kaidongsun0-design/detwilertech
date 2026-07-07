# Detwiler Tech — Setup Guide

B2B 独立站，Next.js 14 + Payload CMS 3 + next-intl + Tailwind CSS。

## 环境要求

- Node.js >= 18（本机已确认 v24.15.0）
- npm >= 9（本机已确认 11.12.1）
- Git（本机已确认）

## 快速开始（首次安装）

```powershell
# 1. 进入项目目录
cd D:\Tool\claude_web\detwilertech

# 2. 复制环境变量模板
copy .env.example .env

# 3. 编辑 .env，至少修改 PAYLOAD_SECRET（可以用任意 32+ 字符串）
notepad .env

# 4. 安装依赖（首次约 2-5 分钟）
npm install

# 5. 生成 Payload 类型
npm run generate:types

# 6. 启动开发服务器
npm run dev
```

启动成功后：
- 前台（中文）：http://localhost:3000/zh
- 前台（英文）：http://localhost:3000/en
- 管理后台：http://localhost:3000/admin （首次访问会自动跳到创建管理员账号页）

## Phase 1 验收清单

打开 http://localhost:3000 后请确认：

- [ ] 根路径 `/` 自动跳转到 `/en` 或 `/zh`
- [ ] 顶部右上角语言切换 EN ⇄ 中 正常切换，URL 前缀变化
- [ ] 首页 Hero 区块：标题、副标题、两个 CTA 按钮（浏览产品 / WhatsApp）显示正常
- [ ] "Featured Products" 区块显示 4 张占位产品卡片
- [ ] "Why Choose Us" 4 个优势区块显示
- [ ] "Payment Methods" 区块：Cash on Delivery 高亮，其他 6 个灰显且标 "Coming Soon"
- [ ] "Ready to Start" CTA 区块显示
- [ ] Header 顶部条联系信息（邮箱/电话）显示
- [ ] 移动端汉堡菜单可弹出
- [ ] /products、/about、/contact 三个二级页面都能打开
- [ ] /admin 能进入 Payload 后台登录页

## 常见问题

### npm install 失败
- 检查网络（需要能访问 npm 官方 registry 或国内镜像）
- 如使用国内镜像：`npm config set registry https://registry.npmmirror.com`

### Payload admin 报 "Payload secret missing"
- 检查 `.env` 中 `PAYLOAD_SECRET` 是否设置（≥16 字符）

### 端口 3000 被占用
- 修改启动命令：`npm run dev -- -p 3001`

## 目录结构速览

```
src/
├── app/
│   ├── (payload)/           # Payload admin 与 API
│   │   ├── admin/
│   │   └── api/
│   ├── [locale]/            # 用户端（i18n 路由）
│   │   ├── layout.tsx
│   │   ├── page.tsx         # 首页
│   │   ├── products/
│   │   ├── about/
│   │   └── contact/
│   ├── globals.css
│   └── layout.tsx
├── collections/             # Payload 集合定义
├── components/
│   ├── ui/                  # shadcn 组件
│   ├── layout/              # Header, Footer, LangSwitcher
│   └── home/                # 首页区块组件
├── i18n/                    # next-intl 配置
│   ├── routing.ts
│   ├── request.ts
│   └── messages/
│       ├── en.json
│       └── zh.json
├── lib/                     # 工具与配置
│   ├── utils.ts
│   ├── env.ts
│   └── payment-methods.ts   # 支付预留插槽
├── payload.config.ts        # Payload 主配置
└── middleware.ts            # next-intl 中间件
```

## Phase 2 准备工作

Phase 2（产品中心 + 三大询盘入口）开始前需要：

1. **产品数据采集**：在 PowerShell 执行 `npm run scrape:cobtel`（脚本将在 Phase 2 开始时交付）
2. **图片素材**：运行抓取脚本会自动下载到 `public/media/products/`
3. **联系信息确认**：在 `.env` 中填入实际的销售邮箱、WhatsApp 号、公司地址

## 后续阶段

| Phase | 范围 | 状态 |
|---|---|---|
| Phase 1 | 项目骨架 + 首页 | ✅ 当前 |
| Phase 2 | 产品中心 + 询盘功能 | 待启动 |
| Phase 3 | Payload CMS 后台完善 | 待启动 |
| Phase 4 | SEO / 部署上线 | 待启动 |
| Phase 5 | 支付集成（按需启用）| 预留插槽已就位 |
